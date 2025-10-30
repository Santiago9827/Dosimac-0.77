/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/App3.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        RobotoRegular: ["Roboto-Regular"],
        PoppinsLight: ["Poppins-Light"]
      }
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },

  plugins: [
    // require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    // require('@tailwindcss/aspect-ratio'),
    // require('@tailwindcss/container-queries'),    
  ],
}

