import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

export default {
  input: "./index.js",
  output: [
    {
      file: './dist/keyboard.js',
      name: 'keyboardJS',
      format: 'umd',
      sourcemap: 'inline'
    },
    {
      file: './dist/keyboard.min.js',
      name: 'keyboardJS',
      format: 'umd',
      plugins: [terser()]
    }
  ],
  plugins: [babel({
    presets: ['@babel/preset-env'],
    babelHelpers: 'bundled'
  })]
}
