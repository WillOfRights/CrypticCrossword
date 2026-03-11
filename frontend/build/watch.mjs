import { argv } from 'node:process';
import * as esbuild from 'esbuild';

import { createBuildContext } from './esbuild.config.mjs';

const buildContext = createBuildContext(argv);
const buildJS = await esbuild.context(buildContext);

await buildJS.watch();
