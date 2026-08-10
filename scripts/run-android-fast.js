const path = require('path');
const {spawnSync} = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const gradleUserHome = path.join(projectRoot, '.gradle-cache');
const reactNativeCli = path.join(
  projectRoot,
  'node_modules',
  'react-native',
  'cli.js',
);

const args = [
  reactNativeCli,
  'run-android',
  '--active-arch-only',
  ...process.argv.slice(2),
];

const result = spawnSync(process.execPath, args, {
  cwd: projectRoot,
  env: {
    ...process.env,
    GRADLE_USER_HOME: process.env.GRADLE_USER_HOME || gradleUserHome,
  },
  stdio: 'inherit',
  shell: false,
});

process.exit(result.status ?? 1);
