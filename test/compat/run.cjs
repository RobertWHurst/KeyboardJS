const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '../..');
const tarball = process.argv[2] ? path.resolve(process.argv[2]) : null;
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'keyboardjs-compat-'));

const run = (cmd, args, options = {}) => execFileSync(cmd, args, { cwd: work, encoding: 'utf8', ...options }).trim();

fs.cpSync(__dirname, work, { recursive: true, filter: (src) => !/node_modules|[\\/]out$/.test(src) });
const packed = tarball || path.join(work, run('npm', ['pack', repo, '--silent']).split('\n').pop());
run('npm', ['install', '--no-audit', '--no-fund', '--silent']);
run('npm', ['install', '--no-audit', '--no-fund', '--silent', '--no-save', packed]);

const legacyEnv = { ...process.env, NODE_OPTIONS: '--openssl-legacy-provider' };
const checks = [
  ['node require', () => run('node', ['node-check.cjs'])],
  ['node import', () => run('node', ['node-check.mjs'])],
  ['webpack 4', () => run('node', [run('node', ['bundle.cjs', 'webpack4', 'src/legacy-entry.js'], { env: legacyEnv })])],
  ['webpack 5', () => run('node', [run('node', ['bundle.cjs', 'webpack5', 'src/entry.js'])])],
  ['esbuild', () => run('node', [run('node', ['bundle.cjs', 'esbuild', 'src/entry.js'])])],
  ['vite', () => run('node', [run('node', ['bundle.cjs', 'vite', 'src/entry.js'])])],
  ['typescript node10', () => run('npx', ['tsc', '-p', 'ts/tsconfig.node10.json'])],
  ['typescript node16', () => run('npx', ['tsc', '-p', 'ts/tsconfig.node16.json'])],
  ['typescript bundler', () => run('npx', ['tsc', '-p', 'ts/tsconfig.bundler.json'])],
  ['are the types wrong', () => run('npx', ['attw', packed, '--entrypoints', '.', './dist/keyboard', './dist/keyboard.js'])]
];

let failed = 0;
for (const [label, check] of checks) {
  try {
    check();
    console.log(`pass  ${label}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL  ${label}\n${[err.stdout, err.stderr, err.message].filter(Boolean).join('\n')}`);
  }
}

fs.rmSync(work, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
