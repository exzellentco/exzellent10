import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // eslint-plugin-react is not installed, so nothing here counts a JSX tag
      // as a use of the identifier behind it. Two consequences, both false
      // positives rather than real dead code:
      //   <motion.div>  does not mark `motion` as used  -> allow it by name
      //   ({ icon: Icon }) => <Icon />  is an ARG, not a var, so the existing
      //   varsIgnorePattern never applied to it -> mirror the pattern for args
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^([A-Z_]|motion$)',
        argsIgnorePattern: '^([A-Z_]|_)',
      }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Build/tooling config files are CommonJS Node modules.
    files: ['*.config.js', '*.cjs'],
    languageOptions: {
      globals: globals.node,
      parserOptions: { sourceType: 'commonjs' },
    },
  },
]
