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
import * as modifier from '../manifest.overrides'
const args = minimist(process.argv.slice(2), opts)
export const buildTarget: 'chromium' | 'firefox' | 'safari' | 'E2E' = args.target
export const buildArchitecture: 'app' | 'web' = args.arch
export const buildResolution: 'desktop' | 'mobile' = args.resolution
export const reproducibleBuild: boolean = args.reproducible
// fennec is Firefox for Android before https://github.com/mozilla-mobile/fenix lands
// in future there will only be geckoview
export const firefoxVariant: 'fennec' | 'geckoview' = args.firefox
if (!(buildTarget in modifier)) throw new Error(`Unknown target ${buildTarget}`)
if (!['app', 'web'].includes(buildArchitecture)) throw new Error(`Unknown platform ${buildArchitecture}`)
if (!['desktop', 'mobile'].includes(buildResolution)) throw new Error(`Unknown resolution ${buildResolution}`)
if (!['fennec', 'geckoview'].includes(firefoxVariant)) throw new Error(`Unknown Firefox variant ${firefoxVariant}`)

export function getEnvironment(mode: Configuration['mode']) {
    return {
        NODE_ENV: buildTarget === 'E2E' ? 'test' : mode,
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
