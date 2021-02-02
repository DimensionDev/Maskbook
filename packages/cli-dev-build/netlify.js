const { series, parallel, src, dest } = require('gulp')
const { exec } = require('child_process')

const { join } = require('path')
const root = join(__dirname, '../../')
const dashboard = join(__dirname, '../dashboard')
const theme = join(__dirname, '../theme')
const netlify = join(__dirname, '../netlify')

const createBuildStorybook6 = (basePath, name) => {
    const f = () => exec(`npx build-storybook`, { cwd: basePath, shell: true })
    f.displayName = name + '-storybook'
    f.description = `Build storybook of ${name}`
    return f
}

function copy(path, out) {
    const f = () => src(join(path, './storybook-static/*')).pipe(dest(join(netlify, out)))
    f.displayName = 'Copy assets to ' + out
    return f
}

const { build } = require('./ts')
const a = createBuildStorybook6(dashboard, 'dashboard')
const b = createBuildStorybook6(theme, 'theme')

exports.buildNetlify = series(
    build,
    parallel(a, b),
    copy(dashboard, './dashboard-storybook'),
    copy(theme, './theme-storybook'),
)
