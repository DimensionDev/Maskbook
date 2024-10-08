import { promises as fs } from 'node:fs'
import { resolve, join } from 'node:path'
import { shell, awaitChildProcess } from '../scripts/src/utils/index.ts'

type Primitive = string | number | boolean

interface ConstantsConfig {
    [key: string]: Record<string, Primitive | Primitive[]>
}

// Function to read the constants from a file
async function readConstantsFile(filePath: string): Promise<ConstantsConfig> {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
}

// Function to write constants to a file
async function writeConstantsFile(filePath: string, constants: ConstantsConfig): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(constants, null, 4), 'utf-8')
}

// Function to get the default value for a given value type
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

// Function to filter out non-blank pairs from the constants
function filterNonBlankPairs(
    values: Record<string, Primitive | Primitive[]>,
    names: string[],
): Array<[string, Primitive | Primitive[]]> {
    return Object.entries(values).filter(([key, value]) => value !== '' || !names.includes(key) || key === 'Mainnet')
}

// Function to process constants based on the provided action
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

    // Run the prettier tool after processing
    await awaitChildProcess(shell`npx prettier --write ${folderPath}`)
}

// Action to compress constants
function compressAction(constants: ConstantsConfig, names: string[]): ConstantsConfig {
    const updatedConstants: ConstantsConfig = {}
    for (const name of Object.keys(constants)) {
        const values = constants[name]
        const nonBlankPairs = filterNonBlankPairs(values, names)
        updatedConstants[name] = Object.fromEntries(nonBlankPairs)
    }
    return updatedConstants
}

// Action to complete constants
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

// Main function to parse command line arguments and perform actions
async function main() {
    const args = process.argv.slice(2)

    if (args.includes('--compress')) {
        await processConstants(join(__dirname, 'evm'), EVM_KEYS, compressAction)
        await processConstants(join(__dirname, 'solana'), SOLANA_KEYS, compressAction)
    }

    if (args.includes('--complete')) {
        await processConstants(join(__dirname, 'evm'), EVM_KEYS, completeAction)
        await processConstants(join(__dirname, 'solana'), SOLANA_KEYS, completeAction)
    }
}

if (process.env.NODE_ENV !== 'test') {
    main()
}
