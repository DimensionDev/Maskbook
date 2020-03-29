const path = require('path')
const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
    preset: 'jest-puppeteer',
    testRegex: ['/e2e/integration/.*\\.[jt]sx?$'],
    testTimeout: 60 * 1000,
    transform: {
        ...tsjPreset.transform,
    },
}
