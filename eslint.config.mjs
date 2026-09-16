import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import prettier from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/types/pocketbase-types.ts',
  ]),
  {
    plugins: {
      'no-relative-import-paths': noRelativeImportPaths,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'react/jsx-boolean-value': ['error', 'never'],
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          rootDir: 'src',
          prefix: '@',
        },
      ],
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'prettier/prettier': 'warn',
      'no-restricted-imports': [
        2,
        {
          patterns: [
            {
              group: ['ai'],
              importNames: ['generateText'],
              message: 'Please import generateText from `src/lib/llm` instead.',
            },
            {
              group: ['ai'],
              importNames: ['streamText'],
              message: 'Please import streamText from `src/lib/llm` instead.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env'][property.name=/^NEXT_PUBLIC_/]",
          message:
            "Use `env('NEXT_PUBLIC_*')` from `next-runtime-env` instead of `process.env.NEXT_PUBLIC_*` so the value is read at runtime, not baked at build time.",
        },
      ],
    },
  },
]);
