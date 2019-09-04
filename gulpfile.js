const { src, task, watch, dest, series, parallel } = require('gulp');
const eslint = require('gulp-eslint');
const ts = require('gulp-typescript');
const minify = require('gulp-minify');
const merge2 = require('merge2');
const sourcemap = require('gulp-sourcemaps');
const chalk = require('chalk');
const path = require('path');
const { spawn, execFile } = require('child_process');
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
    '!src/angularapp/',
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

task('watcher', (cb) => {
    watch(files, { events: ['all'] }, series('linter', 'compileTs', 'start-dev'));
});

let appRunning = null;

task('start-dev', (cb) => {
    if (appRunning) {
        appRunning.send('kill');
        appRunning = null;
    }

    Promise.resolve('tick').then(() => {
        appRunning = spawn('node', ['apprunners'], {
                stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
                cwd: path.join(__dirname),
            })
            .on('data', (data) => {
                console.log(data.toString());
            })
            .on('error', (err) => {
                console.log(chalk.red(`error inside start-dev task ${err}`));
            });

        cb();
    });
});

task('default', series('watcher'));