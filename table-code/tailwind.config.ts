import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "min-h-screen",
    "bg-gray-50",
    "p-6",
    "grid",
    "grid-cols-1",
    "md:grid-cols-2",
    "lg:grid-cols-4",
    "text-lg",
    "font-semibold",
    "mb-4",
    "text-sm",
    "text-gray-500",
    "flex",
    "justify-between",
    "items-center",
    "outline-none",
    "rounded-lg",
    "rounded-md",
    "rounded-sm",
    "shadow",
    "border",
    "border-gray-200",
    "hover:bg-gray-100",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
