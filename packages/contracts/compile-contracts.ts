import { promises as fs } from 'fs'
import path from 'path'
import { tsGenerator } from 'ts-generator'
import { TypeChain } from 'typechain/dist/TypeChain'
import { run } from '../../scripts/utils'

const PKG_PATH = path.join(__dirname, '..', 'maskbook')
const ABIS_PATH = path.join(PKG_PATH, 'abis')
const GENERATED_PATH = path.join(PKG_PATH, 'src', 'contracts')

async function replaceFileAll(file: string, pairs: [string, string][]) {
    let content = await fs.readFile(file, 'utf-8')
    for (const [search, value] of pairs) {
        content = content.replace(search, value)
    }
    await fs.writeFile(file, content, 'utf-8')
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
    await replaceFileAll(definitionFilePath, [
        ['web3/promiEvent', 'promievent'],
        ['import { EventLog }', 'import { EventLog, TransactionReceipt }'],
        [
            'send(options?: EstimateGasOptions): PromiEvent<T>',
            'send(options?: EstimateGasOptions, callback?: (error: Error | null, hash: string) => void): PromiEvent<TransactionReceipt>',
        ],
        [
            'send(tx?: Tx): PromiEvent<T>',
            'send(tx?: Tx, callback?: (error: Error | null, hash: string) => void): PromiEvent<TransactionReceipt>',
        ],
    ])

    // format code
    run(undefined, 'npx', 'prettier', GENERATED_PATH, '--write')
}

main()
