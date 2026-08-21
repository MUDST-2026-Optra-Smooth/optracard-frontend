import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Global ignores (replaces .eslintignore)
    ignores: ['dist/**', 'node_modules/**', 'build/**'],
  },
  {
    // Apply rules specifically to TypeScript/JavaScript files
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
    },
  }
);