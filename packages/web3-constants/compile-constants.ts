import { promises as fs } from 'fs'
import { resolve, join } from 'path'
import { run } from '@masknet/web3-contracts/utils'

async function compileConstants(folderPath: string, names: string[]) {
    // fix constants
    for (const file of await fs.readdir(folderPath)) {
        const filePath = resolve(folderPath, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const constants: Record<string, Record<string, unknown>> = JSON.parse(data)
        for (const name of Object.keys(constants)) {
            const values = constants[name]
            const pairs: Array<[string, unknown]> = []
            for (const name of names) {
                pairs.push([name, values[name] ?? getDefaultValue(Object.values(values)[0])])
            }
            pairs.sort(([a], [b]) => names.indexOf(a) - names.indexOf(b))
            constants[name] = Object.fromEntries(pairs)
        }
        await fs.writeFile(filePath, JSON.stringify(constants, null, 4), 'utf-8')
    }

    // format files
    run(undefined, 'npx', 'prettier', '--write', folderPath)
}

function getDefaultValue(value: unknown) {
    if (Array.isArray(value)) {
        return []
    }
    switch (typeof value) {
        case 'string':
            return ''
        case 'number':
            return 0
        case 'boolean':
            return false
    }
    return null
}

compileConstants(join(__dirname, 'evm'), [
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
])

compileConstants(join(__dirname, 'solana'), ['Mainnet', 'Testnet', 'Devnet'])

compileConstants(join(__dirname, 'flow'), ['Mainnet', 'Testnet'])
