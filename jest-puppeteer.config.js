const { join } = require('path')
const { readdirSync, existsSync, lstatSync, unlinkSync, rmdirSync } = require('fs')

// load envs
require('dotenv').config({
    path: join(__dirname, '.env', `e2e-${process.env.NODE_ENV}`),
})

// clean user data
function deleteFolderRecursive(dirPath) {
    if (!existsSync(dirPath)) {
        return
    }
    readdirSync(dirPath).forEach((file) => {
        const curPath = join(dirPath, file)
        if (lstatSync(curPath).isDirectory()) {
            deleteFolderRecursive(curPath)
        } else {
            unlinkSync(curPath)
        }
    })
    rmdirSync(dirPath)
}

deleteFolderRecursive(
    join(
        process.env.E2E_ALICE_USER_DATA_DIR,
        `./Default/IndexedDB/chrome-extension_${process.env.E2E_EXT_ID}_0.indexeddb.leveldb`,
    ),
)

deleteFolderRecursive(
    join(process.env.E2E_ALICE_USER_DATA_DIR, 'Default', 'Local Extension Settings', process.env.E2E_EXT_ID),
)

// TODO:
// This judgment can be removed when the ESM branch released
if (!existsSync(process.env.E2E_EXT_DIR)) {
    process.env.E2E_EXT_DIR = './temp/extension'
}

module.exports = {
    launch: {
        dumpio: true,
        headless: false,

        // more: https://github.com/puppeteer/puppeteer/issues/1649#issuecomment-354046341
        executablePath: process.env.CHROMIUM_PATH,

        // more: https://peter.sh/experiments/chromium-command-line-switches/
        args: [
            '--no-sandbox',
            '--disable-infobars',
            '--disable-setuid-sandbox',
            `--disable-extensions-except=${process.env.E2E_EXT_DIR}`,
            `--load-extension=${process.env.E2E_EXT_DIR}`,
            `--user-data-dir=${process.env.E2E_ALICE_USER_DATA_DIR}`,
            `--user-agent=${process.env.E2E_USER_AGENT}`,
        ],
    },
    browser: 'chromium',
    browserContext: 'default',
}
