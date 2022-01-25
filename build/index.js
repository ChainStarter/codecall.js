const {rollup} = require('rollup')
const browserify = require('browserify')();
const {getDependencieNames,toStringTag} = require("package-tls");
const {default: resolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const cleanup = require('rollup-plugin-cleanup');
const del = require('rollup-plugin-delete');
const { babel } = require('@rollup/plugin-babel');
const { terser } = require("rollup-plugin-terser");
const path = require("path")
const fs = require('fs')
const pkg = require('../package.json');

const outputDir = path.resolve(`${__dirname}/../dist`);

const shareOutput = {
  banner: toStringTag(2)`
/*
${pkg.name}	${pkg.version && "v"+ pkg.version}
author: ${pkg.author}
license: ${pkg.license}
homepage: ${pkg.homepage}
repository: ${pkg.repository}
description: ${pkg.description}
*/
`,
  dir:`${outputDir}`,

  entryFileNames:`[name].js`
};

const babelOptions = {
  babelHelpers: 'runtime',
  presets: ['@babel/preset-env'],
  plugins: [['@babel/plugin-transform-runtime', { useESModules: true }]]
}

const coreConf = {
  input: 'src/core/node.js',
  external: getDependencieNames(pkg),
  plugins: [
    del({ targets: 'dist/*' }),
    // 使用node解析算法查找模块
    resolve({
      browser:false,
      preferBuiltins:true,
      extensions: ['.js']
    }),
    json(),
    commonjs({
      defaultIsModuleExports: true
    }),
    terser(),
    cleanup(),
  ]
}


const clientConf = {
  input: 'src/client.js',
  external: getDependencieNames(pkg),
  plugins: [
    resolve({
      browser:true,
      preferBuiltins:true,
      extensions: ['.js']
    }),
    json(),
    commonjs(),
    babel(babelOptions),
    terser(),
    cleanup(),
  ]
}

const workerConf = {
  input: 'src/worker.js',
  external: getDependencieNames(pkg),
  treeshake: false,
  plugins: [
    resolve({
      browser:true,
      preferBuiltins: true,
      extensions: ['.js']
    }),
    json(),
    commonjs(),
    babel(babelOptions),
    terser(),
    cleanup(),
  ]
};

const tasks = [
  {
    input: coreConf,
    output: {
      ...shareOutput,
      format: 'cjs',
      exports: 'auto',
    }, // CommonJS
  },
  {
    input: clientConf,
    output: {
      ...shareOutput,
      format: 'es'
    },  // ES module
  },
  {
    input: {
      context : "this",
      ...workerConf
    },
    output: {
      ...shareOutput,
      entryFileNames: "worker.tmp.js",
      format: 'cjs'
    },  // ES module
  }
];

async function build(task) {
  let bundle;
  let buildFailed = false;
  try {
    // create a bundle
    const bundle = await rollup(task.input);
    await bundle.write(task.output)
  } catch (error) {
    // do some error reporting
    console.error(error);
  }
  if (bundle) {
    // closes the bundle
    await bundle.close();
  }
}

async function main() {

  for(let i=0; i < tasks.length; i++){
    await build(tasks[i])
  }

  const tmpFile = `${outputDir}/worker.tmp.js`
  const bundleFs = fs.createWriteStream(`${outputDir}/codecall.worker.js`)
  browserify.add(tmpFile).plugin('tinyify')
  browserify.bundle().pipe(bundleFs)
  bundleFs.on('finish', () => {
    fs.unlinkSync(tmpFile)
  })

}

main()