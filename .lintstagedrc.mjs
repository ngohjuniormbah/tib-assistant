import { relative } from 'path';

const buildEslintCommand = (filenames) =>
  `eslint --fix ${filenames.map((f) => relative(process.cwd(), f)).join(' ')}`;

const rules = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand], // linting
  'src/**/*.{ts,tsx}': ['bash -c tsc -p tsconfig.json --noEmit'], // typescript types check
};

export default rules;
