import commonjs from '@rollup/plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from "rollup-plugin-uglify";
import replace from 'rollup-plugin-replace';
import { babel } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript';
import less from 'rollup-plugin-less';

const NODE_ENV = process.env.NODE_ENV;
const TEST = NODE_ENV === 'dev';

export default {
  input: './src/core/MonkeyGrid.ts',
  output: {
    file: './dist/monkeyGrid/index.js',
    name: 'MonkeyGrid',
    format: 'umd',
    // globals: {
    //   axios: 'axios',
    // },
    sourcemap: true
  },
  plugins: [
    resolve({ browser: true }),
    typescript(),
    less({
      output: './dist/monkeyGrid/style.css'
    }),
    commonjs({
      browser: true,
      include: 'node_modules/**',
    }),
    babel({ 
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
      plugins: [
        ['@babel/plugin-transform-runtime']
      ]
    }),
    replace({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }),
    uglify()
  ],
};
