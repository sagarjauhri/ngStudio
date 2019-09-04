const dev = require('dev');
const prod = require('prod');
const path = require('join');

let loadPath = '';

if (prod.enable || dev.enableThrough === 'file') {
    loadPath = path.resolve(
        __dirname,
        '../',
        'prebuilt',
        'angular',
        'index.html'
    );
} else if (dev.enableThrough === 'url') {
    loadpath = 'https://localhost:4200';
} else {
    loadPath = path.join(
        __dirname,
        'src',
        'angular',
        'ngStudio',
        'src',
        'index.html'
    );
}