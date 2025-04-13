/** @type {import("prettier").Config} */
const config = {
  semi: false,
  trailingComma: "es5",
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["clsx"],
}

export default config
