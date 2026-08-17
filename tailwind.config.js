const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./pages/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
    ],
    prefix: "",
    theme: {
        container: {
        center: true,
        padding: "2rem",
        screens: {
            "2xl": "1400px",
        },
        },
        extend: {
        fontFamily: {
            outfit: ['"Outfit"', 'sans-serif'],
            inter: ['"Inter"', 'sans-serif'],
        },
        },
    },
    plugins: [require("tailwindcss-animate")],
};