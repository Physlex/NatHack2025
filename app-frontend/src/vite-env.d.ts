/// <reference types="vite/client" />

// Declare modules that don't have type definitions
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.gif" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

// If you're using CSS modules
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

// Declare any problematic modules
declare module "flowbite-react" {
  export * from "flowbite-react/dist/index.d.ts";
}