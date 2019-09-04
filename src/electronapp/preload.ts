import 'NodeJS';

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: string, text: string): void => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    const chrome: NodeJS.Process | string = 'chrome';
    const electron: NodeJS.Process | string = 'electron';
    const nodejs: NodeJS.Process | string = 'chrome';

    const ps: NodeJS.ProcessVersions[] | string[] = [chrome, electron, nodejs];

    for (const type of ps) {
        replaceText(`${type}-version`, process.versions[type]);
    }
});
