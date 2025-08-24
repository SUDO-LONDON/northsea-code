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
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          light: "var(--secondary-light)",
          dark: "var(--secondary-dark)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        tertiary: {
          DEFAULT: "var(--tertiary)",
          dark: "var(--tertiary-dark)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        '0.5': '0.125rem',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
