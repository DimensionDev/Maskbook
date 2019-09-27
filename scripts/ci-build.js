const { spawn } = require('./spawn')
const path = require('path')

const base = path.join(__dirname, '../')
process.chdir(base)
async function main() {
    const prepareCommands = getCommands(`
    yarn install --link-duplicates --frozen-lockfile
    yarn lint:report
    ${
        /**
         * Let's do a quick TypeScript check.
         */ 'yarn tsc -p tsconfig_cjs.json'
    }
    sudo apt-get install zip
    `)
    for (const [commands, ...args] of prepareCommands) {
        await spawn(commands, args)
    }
    const currentBranch = (await getCurrentGitBranchName()).toLowerCase()
    for (const [first, ...args] of getCommands(buildTypes(currentBranch))) {
        console.log('executing', first, ...args)
        await spawn(first, args)
    }
    process.exit(0)
}
main().catch(e => {
    console.error(e)
    process.exit(1)
})

/**
 * @param {string} branchName
 */
function buildTypes(branchName) {
    if (branchName.match(/full/)) return getBuildCommand(['base', 'chromium', 'firefox', 'gecko', 'iOS'])
    if (branchName.match(/ios/)) return getBuildCommand(['iOS'])
    if (branchName.match(/android|gecko/)) return getBuildCommand(['firefox', 'gecko'])
    return getBuildCommand(['base', 'chromium', 'firefox'])
}

/**
 * @param {('base' | 'iOS' | 'chromium' | 'firefox' | 'gecko')[]} platforms
 */
function getBuildCommand(platforms) {
    return platforms
        .sort()
        .map(generateCommand)
        .join('\n')
    /** @param {('base' | 'iOS' | 'chromium' | 'firefox' | 'gecko')} type */
    function generateCommand(type) {
        if (type === 'chromium' && platforms.indexOf('base') !== -1) {
            // chromium doesn't have it's own changes yet.
            // just copying base version is acceptable
            return ''
        }
        return `
        echo "Building for target ${type}"
        yarn build:${type.toLowerCase()}
        bash -c "cd build && zip -r ../Maskbook.${type}.zip ./*"
        rm -rf build
        `
    }
}

async function getCurrentGitBranchName() {
    const [git, ...args] = getCommands(`git rev-parse --abbrev-ref HEAD`)[0]
    const branch = await spawn(git, args, { stdio: 'pipe' })
    return branch.split('\n')[0]
}

/**
 * @param {string} string
 */
function getCommands(string) {
    return string
        .split('\n')
        .filter(x => x)
        .map(x => x.split(' ').filter(x => x))
        .filter(x => x.length)
}
