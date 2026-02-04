import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { task } from '../utils/task.ts'
import { awaitChildProcess } from '../utils/awaitChildProcess.ts'
import { shell } from '../utils/run.ts'

const ABIS_PATH = join(import.meta.dirname, '../../../web3-contracts/abis/')
const GENERATED_PATH = join(import.meta.dirname, '../../../web3-contracts/types/')

async function replaceFileAll(file: string, pairs: Array<[string, string] | false>) {
    let content = await fs.readFile(file, 'utf-8')
    for (const x of pairs) {
        if (!x) continue
        const [pattern, value] = x
        content = content.replaceAll(pattern, value)
    }
    if (file.includes('index')) console.log(content)
    await fs.writeFile(file, content, 'utf-8')
}

export async function buildContracts() {
    const cwd = join(GENERATED_PATH, '../')
    const { glob, runTypeChain } = await import('typechain')
    // find all files matching the glob
    const allFiles = glob(cwd, ['./abis/*.json'])

    await fs.rmdir(GENERATED_PATH, { recursive: true })
    await runTypeChain({
        cwd,
        filesToProcess: allFiles,
        allFiles,
        outDir: GENERATED_PATH,
        target: 'web3-v1',
    })
    for (const file of await fs.readdir(GENERATED_PATH)) {
        await replaceFileAll(join(GENERATED_PATH, file), [
            ['from "./types"', "from './types.js'"],
            file.includes('types.ts') && ['web3-core/types', 'web3-core'],
            file.includes('index.ts') && ['";\n', '.js";\n'],
        ])
        await fs.rename(join(GENERATED_PATH, file), join(GENERATED_PATH, file.replace('.ts', '.d.ts')))
    }
    await awaitChildProcess(shell.cwd(GENERATED_PATH)`pnpm exec prettier . --write`)
}
task(buildContracts, 'build-contracts', 'Build .d.ts files from ABI files')
