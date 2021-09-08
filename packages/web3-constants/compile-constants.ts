import { promises as fs } from 'fs'
import path from 'path'
import { run } from '../web3-contracts/utils'

const DATA_PATH = path.join(__dirname, 'data')

const chainNames = [
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
]

async function main() {
    // format files
    run(undefined, 'npx', 'prettier', '--write', DATA_PATH)

    // fix constants
    for (const file of await fs.readdir(DATA_PATH)) {
        const filePath = path.resolve(DATA_PATH, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const constants: Record<string, Record<string, any>> = JSON.parse(data)
        for (const name of Object.keys(constants)) {
            const values = constants[name]
            const defaultValue = getDefaultValue(Object.values(values)[0])
            const pairs: [string, unknown][] = []
            for (const chainName of chainNames) {
                pairs.push([chainName, values[chainName] ?? defaultValue])
            }
            constants[name] = Object.fromEntries(pairs)
        }
        await fs.writeFile(filePath, JSON.stringify(constants, null, 4), 'utf-8')
    }
}

main()

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
