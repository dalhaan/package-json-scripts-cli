import { readFileSync, existsSync } from 'fs';
import { spawn } from 'child_process';
import type { IPackageJson } from 'package-json-type';
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { filter as fuzzyFilter } from 'fuzzy';
import chalk from 'chalk';

inquirer.registerPrompt('autocomplete', inquirerPrompt);

type PackageManager = 'yarn' | 'npm';

const PACKAGE_MANAGERS: PackageManager[] = ['yarn', 'npm'];

// Get scripts object from package.json
const rawJson = readFileSync('./package.json', 'utf8');
const packageJson: IPackageJson = JSON.parse(rawJson);
const scriptsObj = packageJson.scripts;

if (!scriptsObj) {
  console.log('No scripts found.');
  process.exit(1); // Exit process with error
}

// Check what package manager the user is using
let packageManagerDetected: PackageManager | null = null;

if (existsSync('./yarn.lock')) {
  packageManagerDetected = 'yarn';
} else if (existsSync('./package-lock.json')) {
  packageManagerDetected = 'npm';
}

// const packageManager = 'yarn';

// Get scripts
const scripts = Object.keys(scriptsObj);

const fuzzySearch =
  (choices: string[]) => (answersSoFar: never, input?: string) =>
    // Seach scripts for input
    new Promise((resolve) => {
      if (!input) {
        return resolve(choices);
      }
      resolve(fuzzyFilter(input, choices).map((el) => el.original));
    });

// Prompt user
inquirer
  .prompt([
    {
      type: 'autocomplete',
      name: 'packageManagerChoice',
      message: 'Package manager not detected. Which would you like to use?',
      choices: PACKAGE_MANAGERS,
      source: fuzzySearch(PACKAGE_MANAGERS),
      when: packageManagerDetected === null,
    },
    {
      type: 'autocomplete',
      name: 'script',
      message: 'Select script to run:',
      choices: scripts,
      source: fuzzySearch(scripts),
    },
  ])
  .then(
    ({
      packageManagerChoice,
      script,
    }: {
      packageManagerChoice?: PackageManager;
      script: string;
    }) => {
      const packageManager = packageManagerChoice || packageManagerDetected;

      // Log command that is being run
      console.log(chalk.blueBright.bold(`${packageManager} run ${script}`));

      if (packageManager) {
        // Spawn child process to execute script: <yarn | npm> run <script>
        spawn(packageManager, ['run', script], {
          // Binds:
          //   - the current process stdin to the child process stdin (for interactivity if the child process requires user input)
          //   - the child process stdout to the current process stdout (to stream the output of the script)
          //   - the child process stderr to the current process stderr (to stream the errors of the script)
          stdio: [process.stdin, process.stdout, process.stderr],
        });
      } else {
        // Shouldn't be able to get here but just in case something goes terribly wrong.
        console.error(
          'Something went wrong: Package manager not detected or specified.'
        );
        process.exit(1);
      }
    }
  );
