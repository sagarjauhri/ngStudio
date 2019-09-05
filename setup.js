const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { spawn, exec, execSync } = require('child_process');

const type = process.argv[2];
const rootDir = __dirname;

if (type === '--full') {
    const angularDir = path.join(rootDir, 'src', 'angularapp');

    execSync('npm cache clean --force');

    if (fs.existsSync(angularDir)) {
        console.log(chalk.green('Angular already installed'));

        installDep(angularDir);
    } else {
        installAnguler(angularDir);
    }
} else {
    runPreBuiltSetup();
}

function installDep(angularDir) {
    process.chdir(path.join(angularDir, 'ngStudio'));
    console.log(process.cwd(), chalk.green('Installing Angular deps...'));
    const npmCmd = spawn('npm install', {
        shell: true,
        stdio: 'inherit',
    });

    npmCmd
        .on('data', (data) => {
            console.log(data.toString());
        })
        .on('error', (err) => {
            console.log(err);
            process.exit(1);
        })
        .on('close', () => {
            console.log(chalk.green('Angular deps installed'));

            runPreBuiltSetup();
        });
}

function installAnguler(angularDir) {
    fs.mkdirSync(angularDir);

    process.chdir(angularDir);
    const ngCmd = spawn(
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

    console.log(
        require('chalk').green('prebuilt dir is cleaned and ready to work')
    );

    if (fs.existsSync(path.join(rootDir, 'src', 'electronapp', 'env.ts'))) {
        return;
    }
    writeEnvForProject();
}

function runPreBuiltSetup() {
    process.chdir(rootDir);

    const prebuiltPath = path.join(rootDir, 'prebuilt');

    if (fs.existsSync(prebuiltPath)) {
        exec('rm -rf prebuilt', (err, stdout, stderr) => {
            if (err) {
                console.log(chalk.red(`Delete prebuilt dir manually`));
                return;
            }
            fs.mkdirSync(prebuiltPath);
            createDirsInsidePreBuilt(prebuiltPath);
        });
    } else {
        fs.mkdirSync(prebuiltPath);
        createDirsInsidePreBuilt(prebuiltPath);
    }
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