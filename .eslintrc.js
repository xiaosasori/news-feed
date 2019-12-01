module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
  ],
  // add your custom rules here
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "eol-last": 0,
    "no-console": 0,
    "vue/max-attributes-per-line": 0,
    "vue/attributes-order": 0,
    "vue/html-self-closing": 0,
    "vue/html-indent": 0,
    "vue/multiline-html-element-content-newline": 0,
    "vue/order-in-components": 0,
    "vue/singleline-html-element-content-newline": 0
  }
}
