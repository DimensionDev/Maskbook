const opts = {
    string: ['target', 'arch', 'resolution', 'firefox'],
    boolean: ['reproducible'],
    default: {
        target: 'chromium',
        arch: 'web',
        resolution: 'desktop',
        firefox: 'fennec',
        reproducible: false,
    },
}
// @ts-ignore
import minimist from 'minimist'
import type { Configuration } from 'webpack'
import * as modifier from './manifest.overrides'
const args: Record<'chrome' | 'fx' | 'ios' | 'e2e' | 'android' | 'open', boolean | undefined> & {
    target: typeof buildTarget
    arch: typeof buildArchitecture
    resolution: typeof buildResolution
    reproducible: boolean
    firefox: typeof firefoxVariant
} = minimist(process.argv.slice(2), opts) as any
export let buildTarget = ((): 'chromium' | 'firefox' | 'safari' | 'E2E' => {
    if (args.chrome) return 'chromium'
    if (args.fx || args.android) return 'firefox'
    if (args.ios) return 'safari'
    if (args.e2e) return 'E2E'
    return args.target
})()
export let buildArchitecture = ((): 'app' | 'web' => {
    if (args.android || args.ios) return 'app'
    return args.arch
})()
export let buildResolution = ((): 'desktop' | 'mobile' => {
    if (args.ios || args.android) return 'mobile'
    return args.resolution
})()
export let reproducibleBuild = ((): boolean => {
    if (args.fx) return true
    return args.reproducible
})()
// fennec is Firefox for Android before https://github.com/mozilla-mobile/fenix lands
// in future there will only be geckoview
export let firefoxVariant = ((): 'fennec' | 'geckoview' => {
    if (args.android) return 'geckoview'
    return args.firefox
})()
export function setEnv(env: {
    target?: typeof buildTarget
    arch?: typeof buildArchitecture
    resolution?: typeof buildResolution
    repro?: boolean
    fx?: typeof firefoxVariant
}) {
    const { arch, fx, repro, resolution, target } = env
    buildTarget = target ?? buildTarget
    buildArchitecture = arch ?? buildArchitecture
    firefoxVariant = fx ?? firefoxVariant
    reproducibleBuild = repro ?? reproducibleBuild
    buildResolution = resolution ?? buildResolution
}
if (!modifier[buildTarget]) throw new Error(`Unknown target ${buildTarget}`)
if (!['app', 'web'].includes(buildArchitecture)) throw new Error(`Unknown platform ${buildArchitecture}`)
if (!['desktop', 'mobile'].includes(buildResolution)) throw new Error(`Unknown resolution ${buildResolution}`)
if (!['fennec', 'geckoview'].includes(firefoxVariant)) throw new Error(`Unknown Firefox variant ${firefoxVariant}`)

export function getEnvironment(mode: Configuration['mode']) {
    return {
        NODE_ENV: mode,
        target: buildTarget,
        architecture: buildArchitecture,
        resolution: buildResolution,
        firefoxVariant: firefoxVariant,
        STORYBOOK: false,
        ...getGitInfo(),
    }
}
import git from '@nice-labs/git-rev'
function getGitInfo() {
    if (reproducibleBuild || !git.isRepository())
        return {
            BUILD_DATE: new Date(0).toISOString(),
            VERSION: require('../../package.json').version + '-reproducible',
            TAG_NAME: 'N/A',
            COMMIT_HASH: 'N/A',
            COMMIT_DATE: 'N/A',
            REMOTE_URL: 'N/A',
            BRANCH_NAME: 'N/A',
            DIRTY: 'N/A',
            TAG_DIRTY: 'N/A',
        }
    else
        return {
            BUILD_DATE: new Date().toISOString(),
            VERSION: git.describe('--dirty'),
            TAG_NAME: git.tag(),
            COMMIT_HASH: git.commitHash(),
            COMMIT_DATE: git.commitDate().toISOString(),
            REMOTE_URL: git.remoteURL(),
            BRANCH_NAME: git.branchName(),
            DIRTY: git.isDirty(),
            TAG_DIRTY: git.isTagDirty(),
        }
}
