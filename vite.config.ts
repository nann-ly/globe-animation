import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: {}
  },
  resolve: {
    /** Map import paths */
    alias : [
      {find: 'pages', replacement: path.resolve(__dirname, 'src/pages')},
      {find: 'assets', replacement: path.resolve(__dirname, 'src/assets')},
      {find: 'components', replacement: path.resolve(__dirname, 'src/components')},
      {find: 'api', replacement: path.resolve(__dirname, 'src/api')},
      {find: 'hooks', replacement: path.resolve(__dirname, 'src/hooks')},
    ]
  }
})
