#! /usr/bin/env node

import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import type { IPackageJson } from 'package-json-type';
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';

inquirer.registerPrompt('autocomplete', inquirerPrompt);

const rawJson = readFileSync('./package.json', 'utf8');
const packageJson: IPackageJson = JSON.parse(rawJson);

const scripts = packageJson.scripts;

if (!scripts) {
  console.log('No scripts found.');
  process.exit();
}

inquirer
  .prompt([
    {
      type: 'autocomplete',
      name: 'script',
      message: 'Select script to run:',
      choices: Object.keys(scripts),
      source: (answersSoFar: never, input?: string) =>
        new Promise((resolve) => {
          if (!input) {
            return resolve(Object.keys(scripts));
          }
          resolve(Object.keys(scripts).filter((s) => s.startsWith(input)));
        }),
    },
  ])
  .then(({ script }: { script: string }) => {
    spawn('yarn', ['run', script], {
      stdio: [process.stdin, process.stdout, process.stderr],
    });
  });
