import { promises as fs } from 'fs'
import { join } from 'path'
import { runTypeChain, glob } from 'typechain'
import { shell, awaitChildProcess } from '../scripts/src/utils/index.ts'

const GENERATED_PATH = join(import.meta.dirname, 'types')

async function replaceFileAll(file: string, pairs: Array<[string, string]>) {
    let content = await fs.readFile(file, 'utf-8')
    for (const [pattern, value] of pairs) {
        // only replace once.
        // eslint-disable-next-line unicorn/prefer-string-replace-all
        content = content.replace(new RegExp(pattern, 'img'), value)
    }
    await fs.writeFile(file, content, 'utf-8')
}

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
            ['web3-core', 'web3-types'],
        ])
        if (file === 'types.ts') {
            // import type { EventLog, PromiEvent, TransactionReceipt } from 'web3-types'
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

    // add to git stage
    // await awaitChildProcess(shell.cwd(ABIS_PATH)`git add .`)
    // await awaitChildProcess(shell.cwd(GENERATED_PATH)`git add .`)
}

main()
