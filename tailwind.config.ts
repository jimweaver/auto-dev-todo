import type { Config } from 'tailwindcss';

/**
 * Tailwind configuration scoped to the Todo app UI.
 */
const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
