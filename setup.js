const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const type = process.argv[2];
const rootDir = __dirname;

if (type === '--full') {
    const angularDir = path.join(rootDir, 'src', 'angular');

    if (fs.existsSync(angularDir)) {
        fs.rmdirSync(angularDir);
    }

    fs.mkdirSync(angularDir);

    const ngCmd = require('child_process').spawn(
        'ng new', ['ngStudio', '--style=css', '--verbose'], {
            shell: true,
            cwd: angularDir,
            stdio: 'inherit',
        }
    );

    ngCmd.stdout
        .on('data', (data) => {
            console.log(data.toString());
        })
        .on('error', (err) => {
            console.log(err);
            process.exit(1);
        })
        .on('end', () => {
            resetAngularFiles();

            console.log(chalk.green('Angular installed'));

            runPreBuiltSetup();
        });
} else {
    runPreBuiltSetup();
}

function resetAngularFiles() {
    const ANGPATH = path.join(rootDir, 'src', 'angular', 'ngStudio');

    let data = fs.readFileSync(path.join(ANGPATH, 'angular.json'), {
        encoding: 'utf8',
    });

    const angularjson = JSON.parse(data);

    angularjson['projects']['ngStudio']['architect']['build']['options'][
        'outputPath'
    ] = '../../../prebuilt/angular/';

    fs.writeFileSync(
        path.join(ANGPATH, 'angular.json'),
        JSON.stringify(angularjson, null, ' ')
    );

    data = fs.readFileSync(path.join(ANGPATH, 'tsconfig.json'), {
        encoding: 'utf8',
    });

    const tsjson = JSON.parse(data);

    tsjson['compilerOptions']['target'] = 'ES5';
    tsjson['compilerOptions']['module'] = 'commonjs';

    fs.writeFileSync(
        path.join(ANGPATH, 'tsconfig.json'),
        JSON.stringify(tsjson, null, ' ')
    );
}

function createDirsInsidePreBuilt(prebuiltPath) {
    ['angular', 'electron'].forEach((dir) => {
        fs.mkdirSync(path.join(prebuiltPath, dir));
    });
}

function runPreBuiltSetup() {
    process.chdir(rootDir);

    const prebuiltPath = path.join(rootDir, 'prebuilt');

    if (fs.existsSync(prebuiltPath)) {
        const dirs = fs.readdirSync(prebuiltPath);

        if (dirs.length) {
            dirs.forEach((dir) => {
                fs.rmdirSync(path.join(prebuiltPath, dir));
            });
        } else {
            createDirsInsidePreBuilt(prebuiltPath);
        }
    } else {
        fs.mkdirSync(prebuiltPath);
        createDirsInsidePreBuilt(prebuiltPath);
    }

    console.log(
        require('chalk').green('prebuilt dir is cleaned and ready to work')
    );
}