import path from 'path';
import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';

const PORT = 8081;

export default defineConfig(({ mode, command }) => {
  const isDev = command === 'serve' || mode !== 'production';

  const plugins: PluginOption[] = [react()];
  if (isDev) {
    plugins.push(
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
          dev: { logLevel: ['error'] },
        },
        overlay: {
          position: 'tl',
          initialIsOpen: false,
        },
      })
    );
  }

  return {
    plugins,
    resolve: {
      alias: [
        {
          find: /^~(.+)/,
          replacement: path.resolve(process.cwd(), 'node_modules/$1'),
        },
        {
          find: /^src(.+)/,
          replacement: path.resolve(process.cwd(), 'src/$1'),
        },
      ],
    },
    server: { port: PORT, host: true },
    preview: { port: PORT, host: true },
  };
});
