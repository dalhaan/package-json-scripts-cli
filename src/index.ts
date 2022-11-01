#! /usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { spawn } from 'child_process';
import type { IPackageJson } from 'package-json-type';
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { filter as fuzzyFilter } from 'fuzzy';

inquirer.registerPrompt('autocomplete', inquirerPrompt);

// Get scripts object from package.json
const rawJson = readFileSync('./package.json', 'utf8');
const packageJson: IPackageJson = JSON.parse(rawJson);
const scriptsObj = packageJson.scripts;

if (!scriptsObj) {
  console.log('No scripts found.');
  process.exit(1); // Exit process with error
}

// Check what package manager the user is using
const packageManager = existsSync('./yarn.lock') ? 'yarn' : 'npm';

// Get scripts
const scripts = Object.keys(scriptsObj);

// Prompt user
inquirer
  .prompt([
    {
      type: 'autocomplete',
      name: 'script',
      message: 'Select script to run:',
      choices: scripts,
      source: (answersSoFar: never, input?: string) =>
        // Seach scripts for input
        new Promise((resolve) => {
          if (!input) {
            return resolve(scripts);
          }
          resolve(fuzzyFilter(input, scripts).map((el) => el.original));
        }),
    },
  ])
  .then(({ script }: { script: string }) => {
    // Spawn child process to execute script: <yarn | npm> run <script>
    spawn(packageManager, ['run', script], {
      // Binds:
      //   - the current process stdin to the child process stdin (for interactivity if the child process requires user input)
      //   - the child process stdout to the current process stdout (to stream the output of the script)
      //   - the child process stderr to the current process stderr (to stream the errors of the script)
      stdio: [process.stdin, process.stdout, process.stderr],
    });
  });
