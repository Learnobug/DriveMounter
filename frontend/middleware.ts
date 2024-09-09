// middleware.js or middleware.ts

import { clerkMiddleware } from "@clerk/nextjs/server";

// Ensure you pass an object with publicRoutes defined
export default clerkMiddleware({
  publicRoutes: ["/auth"], // Public routes that do not require authentication
});

// Define the routes or paths where this middleware will be applied
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"], // Adjust as needed
};
