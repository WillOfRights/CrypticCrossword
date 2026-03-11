import { sassPlugin } from 'esbuild-sass-plugin';

function createBuildContext(args) {

  const productionMode = args[2] && ('development' !== args[2]);
  return {
    entryPoints: ['../src/entryPoints/*.tsx'],
    bundle: true,
    minify: productionMode,
    sourcemap: !productionMode,
    outdir: '../../backend/src/main/resources/static/js/bundle/',
    plugins: [sassPlugin()],
    external: ['/images/*'],
  };
}

export { createBuildContext };
