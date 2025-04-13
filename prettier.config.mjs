/** @type {import("prettier").Config} */
const config = {
  semi: false,
  printWidth: 120,
  trailingComma: "es5",
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["clsx"],
};

export default config;
