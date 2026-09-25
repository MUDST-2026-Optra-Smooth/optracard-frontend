import { spawn } from 'child_process';

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const args = process.argv.slice(2);
const isWin = process.platform === 'win32';
const cypressCmd = isWin ? 'npx.cmd' : 'npx';

const child = spawn(cypressCmd, ['cypress', ...args], {
  stdio: 'inherit',
  env,
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
