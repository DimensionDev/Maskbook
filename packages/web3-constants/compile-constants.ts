import { promises as fs } from 'fs'
import path from 'path'
import { run } from '../web3-contracts/utils'

async function compileConstants(folderPath: string, names: string[]) {
    // fix constants
    for (const file of await fs.readdir(folderPath)) {
        const filePath = path.resolve(folderPath, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const constants: Record<string, Record<string, unknown>> = JSON.parse(data)
        for (const name of Object.keys(constants)) {
            const values = constants[name]
            const defaultValue = getDefaultValue(Object.values(values)[0])
            const pairs: Array<[string, unknown]> = []
            for (const name of names) {
                pairs.push([name, values[name] ?? defaultValue])
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

compileConstants(path.join(__dirname, 'evm'), [
    'Mainnet',
    'Ropsten',
    'Rinkeby',
    'Kovan',
    'Gorli',
    'BSC',
    'BSCT',
    'Matic',
    'Mumbai',
    'Arbitrum',
    'Arbitrum_Rinkeby',
    'xDai',
    'Avalanche',
    'Avalanche_Fuji',
    'Celo',
    'Fantom',
    'Aurora',
    'Aurora_Testnet',
    'Conflux',
    'Harmony',
    'Harmony_Test',
    'Astar',
])

compileConstants(path.join(__dirname, 'solana'), ['Mainnet', 'Testnet', 'Devnet'])

compileConstants(path.join(__dirname, 'flow'), ['Mainnet', 'Testnet'])
