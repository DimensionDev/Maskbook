const { task, series, parallel, argv } = require('just-task')
const path = require('path')

require('./load')
const { step } = require('./util')
const args = argv()

const prettierCommand = async (str, level = 'log') => {
    await step(['prettier', `--${str}`, './src/**/*.{ts,tsx}', '--loglevel', level])
}
const eslintCommand = ['eslint', '--ext', 'tsx,ts', './src/', '--cache']

task('watch', () => series('react'))
/**
 * @cli-argument fresh {boolean} use a new profile to start over.
 */
task('watch/firefox', () => parallel('react', 'load/firefox'))
task('watch/android', () => parallel('react', 'load/firefox/android'))

task('react', () => parallel('lint/fix', 'react/start'))
task('react/start', () => step(['react-app-rewired', 'start']))
task('react/build', () => step(['react-app-rewired', 'build']))
task('react/test', () => step(['react-app-rewired', 'test']))

task('lint', () => parallel('lint/prettier', 'lint/eslint'))
task('lint/fix', () => parallel('lint/prettier/fix', 'lint/eslint/fix'))
task('lint/prettier', () => prettierCommand('check'))
task('lint/prettier/fix', () => prettierCommand('write', 'warn'))
task('lint/eslint', () => step(eslintCommand))
task('lint/eslint/fix', () => step(eslintCommand.concat('--fix')))

task('storybook', () => parallel('lint/fix', 'storybook/serve'))
task('storybook/serve', () => step(['start-storybook', '-p', '9009', '-s', 'public', '--quiet'], { withWarn: true }))
task('storybook/build', () => step(['build-storybook', '-s', 'public', '--quiet'], { withWarn: true }))

task('install', () => series('install/holoflows'))
task('install/holoflows', async () => {
    if (args.upgrade) {
        await step(['yarn', 'upgrade', '@holoflows/kit'])
    }
    const dir = { cwd: path.join(process.cwd(), 'node_modules/@holoflows/kit') }
    await step(['yarn'], dir)
    await step(['yarn', 'build'], dir)
})
