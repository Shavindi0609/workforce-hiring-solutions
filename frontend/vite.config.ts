import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // මෙය අනිවාර්යයි

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // මෙය මෙහි තිබිය යුතුය
  ],
});