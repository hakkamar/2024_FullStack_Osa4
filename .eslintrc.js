module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    indent: ["error", 2, { SwitchCase: 1 }],
    eqeqeq: "error",
    "no-console": 0,
    "react/prop-types": 0,
  },
};
