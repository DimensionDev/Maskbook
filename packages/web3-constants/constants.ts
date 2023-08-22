import { promises as fs } from 'fs'
import { resolve, join } from 'path'
import { run } from '@masknet/web3-contracts/utils'

type Primitive = string | number | boolean

interface ConstantsConfig {
    [key: string]: Record<string, Primitive | Primitive[]>
}

async function readConstantsFile(filePath: string): Promise<ConstantsConfig> {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
}

async function writeConstantsFile(filePath: string, constants: ConstantsConfig): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(constants, null, 4), 'utf-8')
}

function getDefaultPrimitiveValue(value: Primitive | Primitive[]): Primitive | Primitive[] {
    if (typeof value === 'string') {
        return ''
    } else if (typeof value === 'number') {
        return 0
    } else if (typeof value === 'boolean') {
        return false
    } else if (Array.isArray(value)) {
        return []
    }
    return ''
}

function filterNonBlankPairs(
    values: Record<string, Primitive | Primitive[]>,
    names: string[],
): Array<[string, Primitive | Primitive[]]> {
    return Object.entries(values).filter(([key, value]) => value !== '' || !names.includes(key) || key === 'Mainnet')
}

async function processConstants(
    folderPath: string,
    keys: string[],
    action: (constants: ConstantsConfig, names: string[]) => ConstantsConfig,
): Promise<void> {
    for (const file of await fs.readdir(folderPath)) {
        const filePath = resolve(folderPath, file)
        const constants = await readConstantsFile(filePath)
        const updatedConstants = action(constants, keys)
        await writeConstantsFile(filePath, updatedConstants)
    }

    run(undefined, 'npx', 'prettier', '--write', folderPath)
}

function compressAction(constants: ConstantsConfig, names: string[]): ConstantsConfig {
    const updatedConstants: ConstantsConfig = {}
    for (const name of Object.keys(constants)) {
        const values = constants[name]
        const nonBlankPairs = filterNonBlankPairs(values, names)
        updatedConstants[name] = Object.fromEntries(nonBlankPairs)
    }
    return updatedConstants
}

function completeAction(constants: ConstantsConfig, names: string[]): ConstantsConfig {
    const updatedConstants: ConstantsConfig = {}
    for (const name of Object.keys(constants)) {
        const values = constants[name]
        const updatedValues: Record<string, Primitive | Primitive[]> = {}

        for (const key of names) {
            if (key in values) {
                updatedValues[key] = values[key]
            } else {
                updatedValues[key] = getDefaultPrimitiveValue(values[Object.keys(values)[0]])
            }
        }

        for (const key of Object.keys(values)) {
            if (!names.includes(key)) {
                updatedValues[key] = values[key]
            }
        }

        updatedConstants[name] = updatedValues
    }
    return updatedConstants
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
        await processConstants(join(__dirname, 'evm'), EVM_KEYS, compressAction)
        await processConstants(join(__dirname, 'solana'), SOLANA_KEYS, compressAction)
        await processConstants(join(__dirname, 'flow'), FLOW_KEYS, compressAction)
    }

    if (args.includes('--complete')) {
        await processConstants(join(__dirname, 'evm'), EVM_KEYS, completeAction)
        await processConstants(join(__dirname, 'solana'), SOLANA_KEYS, completeAction)
        await processConstants(join(__dirname, 'flow'), FLOW_KEYS, completeAction)
    }
}

main()
