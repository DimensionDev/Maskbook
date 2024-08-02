import { promises as fs } from 'fs'
import { join } from 'path'
import { task } from '../utils/task.js'
import { awaitChildProcess } from '../utils/awaitChildProcess.js'
import { shell } from '../utils/run.js'

const ABIS_PATH = join(import.meta.dirname, '../../../web3-contracts/abis/')
const GENERATED_PATH = join(import.meta.dirname, '../../../web3-contracts/types/')

async function replaceFileAll(file: string, pairs: Array<[string, string]>) {
    let content = await fs.readFile(file, 'utf-8')
    for (const [pattern, value] of pairs) {
        // only replace once.
        // eslint-disable-next-line unicorn/prefer-string-replace-all
        content = content.replace(new RegExp(pattern, 'img'), value)
    }
    await fs.writeFile(file, content, 'utf-8')
}

export async function buildContracts() {
    const cwd = join(GENERATED_PATH, '../')
    const { glob, runTypeChain } = await import('typechain')
    // find all files matching the glob
    const allFiles = glob(cwd, ['./abis/*.json'])

    await runTypeChain({
        cwd,
        filesToProcess: allFiles,
        allFiles,
        outDir: GENERATED_PATH,
        target: 'web3-v1',
    })

    // rename Qualification to QualificationEvent
    const qualificationDefinition = join(GENERATED_PATH, 'Qualification.ts')
    replaceFileAll(qualificationDefinition, [
        ['type Qualification', 'type QualificationEvent'],
        ['Callback<Qualification>', 'Callback<QualificationEvent>'],
    ])

    await awaitChildProcess(shell.cwd(GENERATED_PATH)`pnpx @magic-works/ts-esm-migrate .`)
    // format code
    await awaitChildProcess(shell.cwd(GENERATED_PATH)`npx prettier . --write`)
    // rename .ts to .d.ts
    for (const file of await fs.readdir(GENERATED_PATH)) {
        await fs.rename(join(GENERATED_PATH, file), join(GENERATED_PATH, file.replace('.ts', '.d.ts')))
    }

    // add to git stage
    await awaitChildProcess(shell.cwd(ABIS_PATH)`git add .`)
    await awaitChildProcess(shell.cwd(GENERATED_PATH)`git add .`)
}
task(buildContracts, 'build-contracts', 'Build .d.ts files from ABI files')
