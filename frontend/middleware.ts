// middleware.js or middleware.ts

import { clerkMiddleware } from "@clerk/nextjs/server";

// Ensure you pass the correct options
export default clerkMiddleware();

// Define the routes or paths where this middleware will be applied
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"], // Adjust as needed
};
