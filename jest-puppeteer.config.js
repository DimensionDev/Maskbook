const path = require('path')
const extPath = path.join(__dirname, './build')
module.exports = {
    launch: {
        dumpio: true,
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-infobars',
            '--disable-setuid-sandbox',
            `--disable-extensions-except=${extPath}`,
            `--load-extension=${extPath}`,
        ],
    },
    browser: 'chromium',
    browserContext: 'default',
}
