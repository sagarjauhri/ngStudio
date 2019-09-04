const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');

const type = process.argv[2];
const rootDir = __dirname;

switch (type) {
    case '--all':
        // will add soon
        break;

    case '--ng':
        const cmd = spawn('ng build', ['--prod', '--baseHref=./'], {
            shell: true,
            cwd: path.join(rootDir, 'src', 'angularapp', 'ngStudio'),
        });

        cmd.stdout
            .on('data', (data) => console.log(data.toString()))
            .on('error', (err) => {
                console.error(chalk.red(err));
                process.exit(1);
            })
            .on('end', () => {
                console.log(
                    chalk.green(
                        'Angular build completed.Build location : `prebuilt directory`'
                    )
                );
            });
        break;

    case '--electron':
        // will add soon
        break;
}