const { src, task, watch, dest, series, parallel } = require('gulp');
const eslint = require('gulp-eslint');
const ts = require('gulp-typescript');
const minify = require('gulp-minify');
const merge2 = require('merge2');
const sourcemap = require('gulp-sourcemaps');
const chalk = require('chalk');
const path = require('path');
const { spawn } = require('child_process');
const killer = require('tree-kill');

const tsProject = ts.createProject('tsconfig.json', {
    outDir: 'prebuilt/electronapp/',
});

process.chdir(path.join(__dirname, 'src', 'electronapp'));

const KILLSIG = 'SIGTERM';

const outDir = tsProject.options.outDir;

const files = [
    '**/**/*.ts',
    '!**/**/*.d.ts',
    '!**/node_modules{,/**}',
    '!build/',
    '!prebuilt/',
    '!src/angularapp/ngStudio/',
];

task('linter', () => {
    return src(files)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

task('compileTs', () => {
    let failed = false;

    function combine() {
        return merge2([
            result.dts.pipe(dest('.')),
            result.js
            // .pipe(
            //     sourcemap.write('.', {
            //         includeContent: false,
            //         sourceRoot: './',
            //     })
            // )
            // .pipe(
            //     minify({
            //         ext: '.min.js',
            //         exclude: ['node_modules'],
            //         ignoreFiles: ['-min.js', '.ts', '.d.ts'],
            //     })
            // )
            .pipe(dest(outDir)),
        ]);
    }

    const result = src(files)
        .pipe(sourcemap.init())
        .pipe(tsProject(ts.reporter.fullReporter(true)))
        .on('error', function() {
            failed = true;
        })
        .on('finish', function() {
            if (!failed) {
                combine();
            } else {
                console.error(
                    chalk.red(
                        'Files are not compiled and saved, first fix the errors'
                    )
                );
            }

            this.emit('end');
        });

    return result;
});

let electronAppProcess = null;

function electronRunner() {
    electronAppProcess = spawn('npx electron .', {
        shell: true,
        stdio: 'inherit',
        cwd: path.join(__dirname, 'prebuilt', 'electronapp'),
    });

    console.log(chalk.blue('Starting Electron:...'));

    electronAppProcess
        .on('data', (d) => {
            console.log(d.toString());
        })
        .on('error', (err) => {
            console.log(chalk.red(`Electron error: ${err} `));
        })
        .on('close', function() {
            console.log(chalk.red('Electron stopped:'));
            electronAppProcess = null;
        });
}

let ngServerProcess = null;

function ngServerRunner() {
    console.log(chalk.blue('Angular dev build started:'));

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

task('start-dev', (cb) => {
    if (ngServerProcess === null) {
        ngServerRunner();
    }

    if (electronAppProcess) {
        killer(electronAppProcess.pid, (err) => {
            if (err) {
                console.log(
                    chalk.red(
                        'Error while stopping electron process, exit it manually'
                    )
                );
                electronAppProcess = null;
            } else {
                console.log(chalk.green('Restarting Electron...'));
                electronRunner();
            }
        });
    } else {
        electronRunner();
    }

    cb();
});

task('watcher', (cb) => {
    watch(files, { events: ['all'] }, series('linter', 'compileTs', 'start-dev'));
});

task('default', series('watcher'));