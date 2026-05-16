module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'import/extensions': ['error', 'ignorePackages', {
      js: 'never',
      jsx: 'never',
    }],
    'import/no-unresolved': ['error', { ignore: ['^@mui/'] }],
    'max-len': 'off',
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
    'react/function-component-definition': ['error', {
      namedComponents: 'function-declaration',
      unnamedComponents: 'arrow-function',
    }],
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
  },
};
