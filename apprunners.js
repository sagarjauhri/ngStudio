const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');

function ngServerRunner() {
    console.log(chalk.blue('Angular build started:'));

    ngServerProcess = spawn('ng serve', ['--open'], {
        shell: true,
        cwd: path.join(__dirname, 'src', 'angularapp', 'ngStudio'),
        stdio: 'inherit',
    });

    ngServerProcess
        .on('data', (d) => {
            console.log(d.toString());
        })
        .on('error', (err) => {
            console.log(chalk.red(`Angular error: ${err} `));
        })
        .on('close', function(code) {
            console.log(chalk.red('Angular server stopped:'));
        });
}

function electronAppRunner() {
    electronAppProcess = spawn('npx electron .', {
        shell: true,
        stdio: 'inherit',
        cwd: path.join(__dirname, 'prebuilt', 'electronapp'),
    });

    console.log(chalk.blue('Electron started:'));

    electronAppProcess
        .on('data', (d) => {
            console.log(d.toString());
        })
        .on('error', (err) => {
            console.log(chalk.red(`Electron error: ${err} `));
        })
        .on('close', function() {
            console.log(chalk.red('Electron stopped:'));
        });
}

process.on('message', (msg) => {
    require('tree-kill')(process.pid, (err) => {
        console.log(`err: {err}`);
    });
});

ngServerRunner();
electronAppRunner();