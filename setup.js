const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const type = process.argv[2];
const rootDir = __dirname;

if (type === '--full') {
    const angularDir = path.join(rootDir, 'src', 'angularapp');

    if (fs.existsSync(angularDir)) {
        console.log(chalk.green('Angular already installed'));

        runPreBuiltSetup();
    } else {
        installAnguler(angularDir);
    }
} else {
    runPreBuiltSetup();
}

function installAnguler(angularDir) {
    fs.mkdirSync(angularDir);

    process.chdir(angularDir);
    const ngCmd = require('child_process').spawn(
        'ng new', ['ngStudio', '--style=css', '--routing', '--verbose'], {
            shell: true,
            stdio: 'inherit',
        }
    );

    ngCmd
        .on('data', (data) => {
            console.log(data.toString());
        })
        .on('error', (err) => {
            console.log(err);
            process.exit(1);
        })
        .on('close', () => {
            resetAngularFiles();

            console.log(chalk.green('Angular installed'));

            runPreBuiltSetup();
        });
}

function resetAngularFiles() {
    const ANGPATH = path.join(rootDir, 'src', 'angularapp', 'ngStudio');

    let data = fs.readFileSync(path.join(ANGPATH, 'angular.json'), {
        encoding: 'utf8',
    });

    const angularjson = JSON.parse(data);

    angularjson['projects']['ngStudio']['architect']['build']['options'][
        'outputPath'
    ] = '../../../prebuilt/angularapp/';

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
    ['angularapp', 'electronapp'].forEach((dir) => {
        fs.mkdirSync(path.join(prebuiltPath, dir));
    });

    fs.writeFileSync(
        path.join(prebuiltPath, 'electronapp', 'package.json'),
        JSON.stringify({
                name: 'electronapp',
                main: 'main.js',
            },
            null,
            ''
        )
    );
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

    writeEnvForProject();
}

function writeEnvForProject() {
    const json = {
        prod: {
            path: path.join('../', 'angularapp', 'index.html'),
            protocol: 'file',
        },
        dev: {
            path: 'http://localhost:4200',
            protocol: 'http',
        },
        whatIsEnv: 'dev',
    };

    const str = `export default ${JSON.stringify(json, null, ' ')};`;

    fs.writeFileSync(path.join(rootDir, 'src', 'electronapp', 'env.ts'), str);

    console.log(
        require('chalk').green(
            `Project env set to ${
                json['whatIsEnv'] === 'dev' ? 'Development' : 'Production'
            }`
        )
    );
}