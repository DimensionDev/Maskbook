// Launches the extension in a local Chrome with puppeteer. Starts an REPL for us to play with.
// USE --experimental-repl-await for an easier time!

const repl = require('repl')
let ppt,
    findCr = false

try {
    ppt = require('puppeteer')
} catch {
    ppt = require('puppeteer-core')
    findCr = true
}

const path = require('path')
const extension = path.join(__dirname, '../build/')

// Extensions only work with non-headless.
// This will have to be refactored to .connect() with puppeteer-firefox.
const pptOpts = {
    headless: false,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
}

// This function follows what chrome-launcher does:
// 1. look in CHROME_PATH
// 2. look in prgm files
//
// Note!!! This does not find things like Chrome Dev. Make a symlink to correct the name.
function findChrome() {
    try {
        const clBase = path.join(require.resolve('chrome-launcher'), '..')
        global.clInt = x => require(path.join(clBase, `${x}.js`))
        return clInt('chrome-finder')[clInt('utils').getPlatform()]()[0]
    } catch (e) {
        console.error(e)
        return
    }
}

if (findCr) {
    pptOpts.executablePath = process.env.CHROME_PATH || findChrome()
}

console.log(pptOpts)
;(async () => {
    global.browser = await ppt.launch(pptOpts)
    repl.start({ useGlobal: true, replMode: repl.REPL_MODE_STRICT, breakEvalOnSigint: true })
})()
