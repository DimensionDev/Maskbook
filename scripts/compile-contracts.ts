import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { tsGenerator } from 'ts-generator'
import { TypeChain } from 'typechain/dist/TypeChain'
import { run } from './utils'

const ABIS_PATH = path.join(__dirname, '../packages/maskbook/abis')
const GENERATED_PATH = path.join(__dirname, '../packages/maskbook/src/contracts')

function replaceFileAll(file: string, substr: string, newSubstr: string) {
    const content = readFileSync(file).toString('utf-8')
    writeFileSync(file, content.replace(substr, newSubstr))
}

async function main() {
    // compile abis to typings
    await tsGenerator(
        { cwd: ABIS_PATH },
        new TypeChain({
            cwd: ABIS_PATH,
            rawConfig: {
                files: '*.json',
                outDir: GENERATED_PATH,
                target: 'web3-v1',
            },
        }),
    )

    // fix some typings bugs
    const definitionFilePath = path.join(GENERATED_PATH, 'types.d.ts')

    replaceFileAll(definitionFilePath, 'import { EventLog }', 'import { EventLog, TransactionReceipt }')
    replaceFileAll(
        definitionFilePath,
        'send(options?: EstimateGasOptions): PromiEvent<T>',
        'send(options?: EstimateGasOptions, callback?: (error: Error | null, hash: string) => void): PromiEvent<TransactionReceipt>',
    )
    replaceFileAll(
        definitionFilePath,
        'send(tx?: Tx): PromiEvent<T>',
        'send(tx?: Tx, callback?: (error: Error | null, hash: string) => void): PromiEvent<TransactionReceipt>',
    )

    // format code
    run(undefined, 'npx', 'prettier', GENERATED_PATH, '--write')
}

main()
