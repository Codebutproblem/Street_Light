import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants/jwt";
import User from "../model/userModel";

interface IJWT {
  id: string;
  username: string;
  role: string;
}

type User = {
  email: string,
  _id: string;
  username: string;
  role: string;
};

const signToken = (user: User) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      // 30 days
      expiresIn: 2592000000,
    }
  );
};

const createSendToken = (
  user: User,
  statusCode: number,
  res: express.Response
) => {
  const token = signToken(user);

  const cookieOptions = {
    // Cookies last for 30 days
    expires: new Date(Date.now() + 30 * 1000 * 24 * 60 * 60),

    // In production only allow cookies be sent through https but in development also allow cookies to be sent through http
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as "lax",
  };

  res.cookie("auth_token", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {
      user,
    },
  });
};

const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  return hashedPassword;
};

// Check Password
const comparePassword = async (passwordInput: string, password: string) => {
  const result = await bcrypt.compare(passwordInput, password);

  return result;
};

//////////////////////////////////////////////////////////

// SignUp new user
export const signUp = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const hashedPassword = await hashPassword(password);
    const user = new User({
      email,
      username: firstName + " " + lastName,
      password: hashedPassword,
    });

    const result = (await user.save()) as User;
    createSendToken(result, 201, res);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "There is something wrong in the server",
    });
  }
};

// Sign In user
export const login = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({
      email,
    });
    console.log(user);
    if (!user) {
      res.status(401).json({
        message: "No user found with this username! Try again",
      });
    }

    if (!user || !(await comparePassword(password, user.password)))
      res.status(401).json({
        status: "unauthorized",
        message: "Your email or password is incorrect!",
      });

    const userPayload: User = {
      _id: user._id as string,
      email: user.email,
      role: user.role as string,
      username: user.username as string,
    };

    createSendToken(userPayload, 200, res);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "There is something wrong in the server",
    });
  }
};

// Logout user
export const logout = (req: express.Request, res: express.Response) => {
  res.cookie("auth_token", "loggedout", {
    expires: new Date(Date.now() + 3 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

// Protect route
export const protect = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let token;

    // Authenticate with Bearer token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Authenticate with cookie
    else if (req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return next({
        statusCode: 401,
        error: "You are not logged in!",
        isDisplay: true,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as IJWT;

    const currentUser = await User.findOne({
      where: {
        id: decoded.id,
      },
    });

    if (!currentUser) {
      res.status(401).json({
        status: "unauthenticated",
        message: "You are not logged in!",
      });
    }

    // Store the user in the request as a session
    // @ts-ignore
    req.user = currentUser;

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "There is something wrong!",
    });
  }
};
