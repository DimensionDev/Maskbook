import { promises as fs } from 'node:fs'
import { resolve, join } from 'node:path'
import { awaitChildProcess } from '../utils/awaitChildProcess.ts'
import { shell } from '../utils/run.ts'
import { task } from '../utils/task.ts'

type Primitive = string | number | boolean

interface ConstantsConfig {
    [property: string]: { [property: string]: Primitive | Primitive[] }
}

// Function to read the constants from a file
async function readConstantsFile(filePath: string): Promise<ConstantsConfig> {
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
}

// Function to write constants to a file
async function writeConstantsFile(filePath: string, constants: ConstantsConfig): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(constants, null, 4), 'utf8')
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
    values: { [property: string]: Primitive | Primitive[] },
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
    await awaitChildProcess(shell`pnpm exec prettier --write ${folderPath}`)
}

// Action to compress constants
function compressAction(constants: ConstantsConfig, names: string[]): ConstantsConfig {
    const updatedConstants: ConstantsConfig = {}
    for (const [name, values] of Object.entries(constants)) {
        const nonBlankPairs = filterNonBlankPairs(values, names)
        updatedConstants[name] = Object.fromEntries(nonBlankPairs)
    }
    return updatedConstants
}

// Action to complete constants
function completeAction(constants: ConstantsConfig, names: string[]): ConstantsConfig {
    const updatedConstants: ConstantsConfig = {}
    for (const [name, values] of Object.entries(constants)) {
        const updatedValues: { [property: string]: Primitive | Primitive[] } = {}

        for (const key of names) {
            updatedValues[key] = key in values ? values[key] : getDefaultPrimitiveValue(values[Object.keys(values)[0]])
        }

        for (const [key, value] of Object.entries(values)) {
            if (!names.includes(key)) {
                updatedValues[key] = value
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
    'Polygon',
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

// Main function to parse command line arguments and perform actions
export async function buildConstants() {
    const args = new Set(process.argv.slice(2))
    const evm = join(import.meta.dirname, '../../../web3-constants/evm/')
    const solana = join(import.meta.dirname, '../../../web3-constants/solana')
    const flow = join(import.meta.dirname, '../../../web3-constants/flow')

    if (args.has('--compress')) {
        await processConstants(evm, EVM_KEYS, compressAction)
        await processConstants(solana, SOLANA_KEYS, compressAction)
        await processConstants(flow, FLOW_KEYS, compressAction)
    }

    if (args.has('--complete')) {
        await processConstants(evm, EVM_KEYS, completeAction)
        await processConstants(solana, SOLANA_KEYS, completeAction)
        await processConstants(flow, FLOW_KEYS, completeAction)
    }
}
task(buildConstants, 'build-constants', 'Build Web3 constants')
