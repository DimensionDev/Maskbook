import { rimraf } from 'rimraf'
import { readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { awaitChildProcess } from '../utils/awaitChildProcess.ts'
import { shell } from '../utils/run.ts'
import { ROOT_PATH } from '../utils/paths.ts'
import { fileURLToPath } from 'node:url'
import { glob, runTypeChain } from 'typechain'

const ABIS_PATH = join(fileURLToPath(ROOT_PATH), './packages/web3-contracts/abis/')
const GENERATED_PATH = join(fileURLToPath(ROOT_PATH), './packages/web3-contracts/types/')

async function replaceFileAll(file: string, pairs: Array<[string, string]>) {
    let content = await readFile(file, 'utf-8')
    for (const [pattern, value] of pairs) {
        // only replace once.
        // eslint-disable-next-line unicorn/prefer-string-replace-all
        content = content.replace(new RegExp(pattern, 'img'), value)
    }
    await writeFile(file, content, 'utf-8')
}

async function buildContracts() {
    const cwd = join(GENERATED_PATH, '../')
    // find all files matching the glob
    const allFiles = glob(cwd, ['./abis/*.json'])

    await rimraf(GENERATED_PATH)
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
    replaceFileAll(join(GENERATED_PATH, 'types.ts'), [['web3-core/types', 'web3-core']])

    await awaitChildProcess(shell.cwd(GENERATED_PATH)`pnpx @magic-works/ts-esm-migrate .`)
    // format code
    await awaitChildProcess(shell.cwd(GENERATED_PATH)`npx prettier . --write`)
    // rename .ts to .d.ts
    for (const file of await readdir(GENERATED_PATH)) {
        if (file.endsWith('.d.ts')) continue
        await rename(join(GENERATED_PATH, file), join(GENERATED_PATH, file.replace('.ts', '.d.ts')))
    }

    // add to git stage
    await awaitChildProcess(shell.cwd(ABIS_PATH)`git add .`)
    await awaitChildProcess(shell.cwd(GENERATED_PATH)`git add .`)
}
await buildContracts()
