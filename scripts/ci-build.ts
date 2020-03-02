import { execFile } from "child_process"
import { promisify } from "util"
import path from "path"
import git from "@nice-labs/git-rev"

type Platform = 'base' | 'iOS' | 'chromium' | 'firefox' | 'gecko'

const exec = promisify(execFile);
const BUILD_PATH = path.join(__dirname, "..", "build")

process.chdir(path.join(__dirname, '../'))

async function main() {
    const branch = git.branchName().toLowerCase()
    const types = buildTypes(branch)
    console.log(`Branch: ${branch}`)
    for (const type of types) {
        await runCommand(type, types.includes("base"))
    }
}

main()

function buildTypes(branchName: string): Platform[] {
    if (branchName.match(/full/) || branchName === 'master')
        return ['base', 'chromium', 'firefox', 'gecko', 'iOS']
    if (branchName.match(/ios/))
        return ['iOS']
    if (branchName.match(/android|gecko/))
        return ['firefox', 'gecko']
    return ['base', 'chromium', 'firefox']
}

async function runCommand(type: Platform, base = false) {
    if (type === 'chromium' && base) {
        // chromium doesn't have it's own changes yet.
        // just copying base version is acceptable
        await exec("cp", ["Maskbook.base.zip", "Maskbook.chromium.zip"])
    }
    console.log(`Building for target: ${type}`)
    await exec("yarn", [`build:${type.toLowerCase()}`])
    await exec("zip", ["-r", `../Maskbook.${type}.zip`, "*"], { cwd: BUILD_PATH })
    await exec("rm", ["-rf", BUILD_PATH])
}
