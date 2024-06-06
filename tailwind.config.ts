import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: '#c9c9b0', // Main background color
        secondary: '#f4f4ec', // Lighter background sections
        accent: '#494632', // Darker accents
        lightBlue: '#E0F0F2', // Light Blue (if needed)
        offWhite: '#F8F6F1', // Off-White
        lightGray: '#E3E1DC', // Light Gray
        textPrimary: '#3A3A3A', // Primary text color
        textSecondary: '#F3F4F6', // Secondary text color
        textSelected:'#FFFFFF', // Selected text color
        feedback: {
          1: '#F3F4F6', // Feedback item background
          2: '#FFFFFF', // Feedback item hover background
        },
        highlight:'#e2e2ce',
        boldhighlight:'#bcb78f', // Bold highlight color
        massivehighlight: '#6b6645', // Massive highlight color
        select:'#000000', // Select color
        pulse: '#A6A57A', // Company pulse color
        survey: '#B8B5A4', // Survey results color
        goals: '#E3E1DC', // Goals section color
        border: '#c2c2c2', // Border color for elements
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md:'10px',
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
