import path from 'path'
import { tsGenerator } from 'ts-generator'
import { TypeChain } from 'typechain/dist/TypeChain'
import { run } from '../cli/utils'

const ABIS_PATH = path.join(__dirname, 'abis')
const GENERATED_PATH = path.join(__dirname, 'types')

async function main() {
    const files = process.argv.includes('--abi') ? `${process.argv[process.argv.length - 1]}.json` : '*.json'
    // compile abis to typings
    await tsGenerator(
        { cwd: ABIS_PATH },
        new TypeChain({
            cwd: ABIS_PATH,
            rawConfig: {
                files,
                outDir: GENERATED_PATH,
                target: 'ethers-v5',
            },
        }),
    )

    // format code
    run(GENERATED_PATH, 'npx', 'prettier', '--write', '.')

    // add to git stage
    run(ABIS_PATH, 'git', 'add', '.')
    run(GENERATED_PATH, 'git', 'add', '.')
}

main()
