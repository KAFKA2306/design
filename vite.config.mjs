import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const commitSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (!/^[0-9a-f]{40}$/.test(commitSha)) {
  throw new Error(`invalid design commit SHA: ${commitSha}`);
}

export default defineConfig({
  base: '/design/',
  define: {
    __DESIGN_COMMIT_SHA__: JSON.stringify(commitSha),
  },
  plugins: [react()],
});
