import { promises as fs } from 'fs'
import { resolve, join } from 'path'
import { run } from '@masknet/web3-contracts/utils'

type Primitive = string | number | boolean

interface ConstantsConfig {
    [key: string]: Record<string, Primitive | Primitive[]>
}

async function compressConstants(folderPath: string, names: string[]) {
    for (const file of await fs.readdir(folderPath)) {
        const filePath = resolve(folderPath, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const constants: ConstantsConfig = JSON.parse(data)
        for (const name of Object.keys(constants)) {
            const values = constants[name]
            const nonBlankPairs: Array<[string, Primitive | Primitive[]]> = []

            for (const [key, value] of Object.entries(values)) {
                if (value !== '' || !names.includes(key) || key === 'Mainnet') {
                    nonBlankPairs.push([key, value])
                }
            }

            constants[name] = Object.fromEntries(nonBlankPairs)
        }
        await fs.writeFile(filePath, JSON.stringify(constants, null, 4), 'utf-8')
    }

    run(undefined, 'npx', 'prettier', '--write', folderPath)
}

async function completeConstants(folderPath: string, names: string[]) {
    for (const file of await fs.readdir(folderPath)) {
        const filePath = resolve(folderPath, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const constants: ConstantsConfig = JSON.parse(data)

        for (const name of Object.keys(constants)) {
            const values = constants[name]
            const updatedValues: Record<string, Primitive | Primitive[]> = {}

            for (const key of names) {
                if (key in values) {
                    updatedValues[key] = values[key]
                } else {
                    // Set default values based on value type
                    let defaultValue: Primitive | Primitive[] = ''
                    if (typeof values[Object.keys(values)[0]] === 'string') {
                        defaultValue = ''
                    } else if (typeof values[Object.keys(values)[0]] === 'number') {
                        defaultValue = 0
                    } else if (typeof values[Object.keys(values)[0]] === 'boolean') {
                        defaultValue = false
                    } else if (Array.isArray(values[Object.keys(values)[0]])) {
                        defaultValue = []
                    }

                    updatedValues[key] = defaultValue
                }
            }

            for (const key of Object.keys(values)) {
                if (!names.includes(key)) {
                    updatedValues[key] = values[key]
                }
            }

            constants[name] = updatedValues
        }

        await fs.writeFile(filePath, JSON.stringify(constants, null, 4), 'utf-8')
    }

    run(undefined, 'npx', 'prettier', '--write', folderPath)
}

const EVM_KEYS = [
    'Mainnet',
    'Ropsten',
    'Rinkeby',
    'Kovan',
    'Gorli',
    'BSC',
    'BSCT',
    'Base',
    'Base_Goerli',
    'Matic',
    'Mumbai',
    'Arbitrum',
    'Arbitrum_Rinkeby',
    'xDai',
    'Optimism',
    'Optimism_Kovan',
    'Optimism_Goerli',
    'Avalanche',
    'Avalanche_Fuji',
    'Celo',
    'Fantom',
    'Aurora',
    'Aurora_Testnet',
    'Conflux',
    'Astar',
]

const SOLANA_KEYS = ['Mainnet', 'Testnet', 'Devnet']

const FLOW_KEYS = ['Mainnet', 'Testnet']

async function main() {
    const args = process.argv.slice(2)

    if (args.includes('--compress')) {
        compressConstants(join(__dirname, 'evm'), EVM_KEYS)
        compressConstants(join(__dirname, 'solana'), SOLANA_KEYS)
        compressConstants(join(__dirname, 'flow'), FLOW_KEYS)
    }

    if (args.includes('--complete')) {
        completeConstants(join(__dirname, 'evm'), EVM_KEYS)
        completeConstants(join(__dirname, 'solana'), SOLANA_KEYS)
        completeConstants(join(__dirname, 'flow'), FLOW_KEYS)
    }
}

main()
