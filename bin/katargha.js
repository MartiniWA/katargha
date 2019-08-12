#!/usr/bin/env node

const fs = require('fs');
const { resolve } = require('path');
const { difference } = require('ramda');

const { Template } = require('../lib/info');

const DEFAULT_CONFIG_PATH = './.katargha.json';

let config = {
  dir: null,
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
  try {
    let data = '';

    fs.accessSync(resolve(file), fs.F_OK);
    data = fs.readFileSync(resolve(file), 'utf-8');

    files.forEach((f) => {
      data += fs.readFileSync(resolve(config.dir, f), 'utf-8');
    });

    fs.writeFileSync(resolve(config.override), data);
    console.log(`Bundle:\n\t${config.override} |> ${getFileSizeInBytes(resolve(config.override))} Bytes\n`);
  } catch (err) {
    console.log('[katargha]:', err.message);
  }
}

function generateBundle(override, files, action) {
  if (action === 'override') {
    overrideAction(override, files);
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
  const { dir, override, output } = loadConfig(DEFAULT_CONFIG_PATH);

  if (!dir) {
    console.log('[katargha]: invalid config! `dir` is required');
    return;
  }

  if (override && output) {
    console.log('[katargha]: Invalid config! You must choose one option between `override` and `output` ');
    return;
  }

  if (override) {
    generateBundle(override, listModules(dir, (cliArgs[0] === '-l')), 'override');
  }

  if (output) {
    generateBundle(output, listModules(dir, (cliArgs[0] === '-l')), 'output');
  }
}

parseArgs(args);
