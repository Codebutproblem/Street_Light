// socket.d.ts
import { Socket } from "socket.io";

// Extend the Socket interface to include the 'user' property
declare module "socket.io" {
  interface Socket {
    user?: {
      userID: string;
      customerID?: string;
      roleCode: string;
    };
  }
}
