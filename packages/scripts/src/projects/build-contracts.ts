import { promises as fs } from 'fs'
import { join } from 'path'
import { task } from '../utils/task.js'
import { awaitChildProcess } from '../utils/awaitChildProcess.js'
import { shell } from '../utils/run.js'

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

    await awaitChildProcess(shell.cwd(GENERATED_PATH)`pnpx @magic-works/ts-esm-migrate .`)
    // format code
    await awaitChildProcess(shell.cwd(GENERATED_PATH)`npx prettier . --write`)
    // rename .ts to .d.ts
    for (const file of await fs.readdir(GENERATED_PATH)) {
        const currentFile = join(GENERATED_PATH, file)
        if (file === 'Qualification.ts') {
            // rename Qualification to QualificationEvent
            await replaceFileAll(currentFile, [
                ['type Qualification', 'type QualificationEvent'],
                ['Callback<Qualification>', 'Callback<QualificationEvent>'],
            ])
        }
        await replaceFileAll(currentFile, [
            ['web3-core/types', 'web3-types'],
            ["import type { EventLog } from 'web3-core'", "import type { EventLog } from 'web3-types'"],
        ])
        if (file === 'types.ts') {
            await replaceFileAll(currentFile, [
                [
                    "import type { EventLog, PromiEvent, TransactionReceipt } from 'web3-types'",
                    "import type { EventLog, TransactionReceipt } from 'web3-types'\nimport type { Web3PromiEvent as PromiEvent } from 'web3-core'\nimport type { SendTransactionEvents } from 'web3-eth'",
                ],
                ['PromiEvent<TransactionReceipt>', 'PromiEvent<TransactionReceipt, SendTransactionEvents>'],
            ])
        }
        if (file.endsWith('.d.ts')) continue
        await fs.rename(join(GENERATED_PATH, file), join(GENERATED_PATH, file.replace('.ts', '.d.ts')))
    }
}
task(buildContracts, 'build-contracts', 'Build .d.ts files from ABI files')
