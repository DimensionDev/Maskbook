import path from 'path'
import { runTypeChain, glob } from 'typechain'
import { run } from '../cli/utils'

const ABIS_PATH = path.join(__dirname, 'abis')
const GENERATED_PATH = path.join(__dirname, 'types')

async function main() {
    const cwd = process.cwd()
    // find all files matching the glob
    const allFiles = glob(cwd, ['./abis/*.json'])

    await runTypeChain({
        cwd,
        filesToProcess: allFiles,
        allFiles,
        outDir: GENERATED_PATH,
        target: 'web3-v1',
    })

    // format code
    run(GENERATED_PATH, 'npx', 'prettier', '--write', '*')

    // add to git stage
    run(ABIS_PATH, 'git', 'add', '.')
    run(GENERATED_PATH, 'git', 'add', '.')
}

main()
