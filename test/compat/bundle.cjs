const path = require('path');

const [bundler, entry] = process.argv.slice(2);
const outDir = path.resolve(__dirname, 'out', bundler);

const webpackBuild = (webpack) => new Promise((resolve, reject) => {
  webpack({
    mode: 'production',
    target: 'web',
    devtool: false,
    optimization: { minimize: false },
    entry: path.resolve(__dirname, entry),
    output: { path: outDir, filename: 'bundle.js' }
  }, (err, stats) => {
    if (err) return reject(err);
    if (stats.hasErrors()) return reject(new Error(stats.toString('errors-only')));
    resolve(path.join(outDir, 'bundle.js'));
  });
});

const builders = {
  webpack4: () => webpackBuild(require('webpack4')),
  webpack5: () => webpackBuild(require('webpack')),
  esbuild: async () => {
    const outfile = path.join(outDir, 'bundle.mjs');
    await require('esbuild').build({
      entryPoints: [path.resolve(__dirname, entry)],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile,
      logLevel: 'warning'
    });
    return outfile;
  },
  vite: async () => {
    const { build } = await import('vite');
    await build({
      root: __dirname,
      logLevel: 'warn',
      build: {
        outDir,
        emptyOutDir: true,
        minify: false,
        commonjsOptions: { include: [/node_modules/, /\.cjs$/] },
        lib: { entry: path.resolve(__dirname, entry), formats: ['es'], fileName: () => 'bundle.mjs' }
      }
    });
    return path.join(outDir, 'bundle.mjs');
  }
};

builders[bundler]().then((file) => console.log(file), (err) => {
  console.error(err);
  process.exit(1);
});
