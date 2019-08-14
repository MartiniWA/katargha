#!/usr/bin/env node

const fs = require('fs');
const { resolve } = require('path');
const { difference } = require('ramda');

const { Template } = require('../lib/info');

const DEFAULT_CONFIG_PATH = './.katargha.json';
const DEFAULT_SRC_DIR_PATH = './sw-modules';
const DEFAULT_DIST_DIR_PATH = './build';

let config = {
  importScript: false,
  dir: {
    src: DEFAULT_SRC_DIR_PATH,
    dist: DEFAULT_DIST_DIR_PATH,
  },
  output: null,
  override: null,
  ignore: [],
};

const [,, ...args] = process.argv;

// Source: https://techoverflow.net/2012/09/16/how-to-get-filesize-in-node-js/
function getFileSizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

function overrideAction(file, files) {
  let data = '';
  const originalFile = resolve(config.dir.dist, file);

  try {
    if (config.importScript) {
      /*
      * Copy all src to dist (except ignored files)
      */
      files.forEach((f) => {
        fs.copyFileSync(resolve(config.dir.src, f), `${resolve(config.dir.dist, f)}`);
      });
    }
    /*
    * Check for destination file
    */
    fs.accessSync(originalFile, fs.F_OK);
    /*
    * Read data from from original service-worker file
    */
    data = fs.readFileSync(originalFile, 'utf-8');
    /*
    * Read Data from custom sw modules (except ignored files) and append/import (based on config)
    */
    files.forEach((f) => {
      if (config.importScript) {
        data += `importScripts('/${f}');`;
      } else {
        data += fs.readFileSync(resolve(config.dir.src, f), 'utf-8');
      }
    });
    /*
    * Override original data
    */
    fs.writeFileSync(resolve(config.dir.dist, config.override), data);
    console.log(`Bundle:\n\t${config.override} |> ${getFileSizeInBytes(originalFile)} Bytes\n`);
  } catch (err) {
    console.log('[katargha]:', err.message);
  }
}

function outputAction(files) {
  let data = '';

  try {
    if (config.importScript) {
      /*
      * Copy all src to dist (except ignored files)
      */
      files.forEach((f) => {
        fs.copyFileSync(resolve(config.dir.src, f), `${resolve(config.dir.dist, f)}`);
      });
    }
    /*
    * Read Data from custom sw modules (except ignored files) and append/import (based on config)
    */
    files.forEach((f) => {
      if (config.importScript) {
        data += `importScripts('/${f}');`;
      } else {
        data += fs.readFileSync(resolve(config.dir.src, f), 'utf-8');
      }
    });

    fs.writeFileSync(resolve(config.dir.dist, config.output), data);
    console.log(`Bundle:\n\t${config.output} |> ${getFileSizeInBytes(resolve(config.dir.dist, config.output))} Bytes\n`);
  } catch (err) {
    console.log('[katargha]:', err.message);
  }
}

function generateBundle(file, files, action) {
  if (action === 'override') {
    overrideAction(file, files);
  }
  if (action === 'output') {
    outputAction(files);
  }
}

function listModules(moduleDir, print = false) {
  try {
    const files = fs.readdirSync(resolve(moduleDir));
    const allFiles = difference(files, config.ignore);
    if (print) {
      console.log(Template);
      console.log(`Module list from ${moduleDir}`);
      allFiles.forEach((file, fIndex) => {
        console.log(`\t${fIndex}) ${file} + |> ${getFileSizeInBytes(resolve(moduleDir, file))} Bytes`);
      });
    }
    return allFiles;
  } catch (err) {
    console.log('[katargha]:', err.message);
  }

  return null;
}

function loadConfig(path) {
  try {
    fs.accessSync(resolve(path), fs.F_OK);
    config = JSON.parse(fs.readFileSync(resolve(path), 'utf-8'));
    return config;
  } catch (err) {
    console.log('[katargha]:', err.message);
  }
  return null;
}

function parseArgs(cliArgs) {
  const {
    dir,
    override,
    output,
  } = loadConfig(DEFAULT_CONFIG_PATH);

  if (!dir) {
    console.log('[katargha]: invalid config! `dir` is required');
    return;
  }

  if (override && output) {
    console.log('[katargha]: Invalid config! You must choose one option between `override` and `output` ');
    return;
  }

  if (override) {
    generateBundle(override, listModules(dir.src, (cliArgs[0] === '-l')), 'override');
  }

  if (output) {
    generateBundle(output, listModules(dir.src, (cliArgs[0] === '-l')), 'output');
  }
}

parseArgs(args);
