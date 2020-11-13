export function OnlyRunInWebWorker() {
    if (typeof browser === 'object') {
        throw new Error('This file should only run in a Web Worker')
    }
}
