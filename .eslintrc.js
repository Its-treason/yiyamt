module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'error',
    // Since React 17 and typescript 4.1 you can safely disable the rule
    'react/react-in-jsx-scope': 'off',
    'no-undef': 'off',
    eqeqeq: 'error',
    quotes: ['error', 'single'],
    camelcase: ['error', { properties: 'always', ignoreGlobals: true }],
    'max-len': ['error', { code: 200, tabWidth: 4 }],
    indent: 'off',
    'comma-dangle': 'off',
    semi: ['error', 'always', { omitLastInOneLineBlock: false }],
    'func-call-spacing': ['error', 'never'],
    'eol-last': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'space-before-blocks': ['error'],
    'no-multi-spaces': [
      'error',
      { exceptions: { VariableDeclarator: false, Property: false } },
    ],
    'block-spacing': 'error',
    'keyword-spacing': ['error', { after: true, before: true }],
    'class-methods-use-this': 'off',
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'no-await-in-loop': 'off',
    'promise/always-return': 'off',
    'promise/catch-or-return': 'off',
    'react/jsx-curly-brace-presence': [
      'error',
      { props: 'always', children: 'never' },
    ],
    'react/require-default-props': 'off',
    'no-plusplus': 'off'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
