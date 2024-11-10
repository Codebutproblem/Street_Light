import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object({
  email: yup
    .string()
    .email("Email address must be valid")
    .required("Please enter your email"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Please enter your password"),
});

const SignIn = () => {
  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });
  const { errors, isSubmitting, isValid } = formState;
  console.log(isSubmitting, isValid);
  const onSubmit = (data) => {
    console.log("Form is being submitted");
    if (isValid) {
      console.log("Send data to backend", data);
    } else {
      console.log("Form is invalid");
    }
  };

  return (
    <div className="absolute w-full max-w-[800px] bg-signUp">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-[500px] mx-auto p-10 border-4 border-[rgb(4_50_113)] bg-[#fff] text-[rgb(27_27_27)] top-[2.5%] left-[80%] transform rounded-xl"
      >
        <div>
          <div className="flex flex-col gap-4 mb-4">
            <label className="text-sm font-medium" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email address"
              {...register("email")}
              className="border-b-4 border-[rgb(4_50_113)] p-5 text-sm font-normal outline-none focus:bg-slate-100"
            />
            <div className="text-sm text-red-400 font-medium ">
              {errors.email?.message}
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              {...register("password")}
              className="border-b-4 border-[rgb(4_50_113)] p-5 text-sm font-normal outline-none focus:bg-slate-100"
            />
            <div className="text-sm text-red-400 font-medium ">
              {errors.password?.message}
            </div>
          </div>
          <span className="text-sm font-normal">
            <a href="#">Forgot password?</a>
          </span>
          <div className=" flex flex-col items-center">
            <button
              type="submit"
              className={`px-10 py-4 bg-black uppercase text-sm font-medium mt-4 text-white rounded-sm w-full ${
                isSubmitting ? "gradient" : ""
              }`}
            >
              Sign In
            </button>
            <div className="flex gap-3 mt-2">
              <span>Don't have an account?</span>
              <a href="/signUp" className="text-[#307517]">
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
