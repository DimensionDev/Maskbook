import { promises as fs } from 'fs'
import path from 'path'
import { run } from '../web3-contracts/utils'

async function compileConstants(folderPath: string, names: string[]) {
    // format files
    run(undefined, 'npx', 'prettier', '--write', folderPath)

    // fix constants
    for (const file of await fs.readdir(folderPath)) {
        const filePath = path.resolve(folderPath, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const constants: Record<string, Record<string, any>> = JSON.parse(data)
        for (const name of Object.keys(constants)) {
            const values = constants[name]
            const defaultValue = getDefaultValue(Object.values(values)[0])
            const pairs: [string, unknown][] = []
            for (const name of names) {
                pairs.push([name, values[name] ?? defaultValue])
            }
            constants[name] = Object.fromEntries(pairs)
        }
        await fs.writeFile(filePath, JSON.stringify(constants, null, 4), 'utf-8')
    }
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
])

compileConstants(path.join(__dirname, 'solana'), ['mainnet-beta', 'testnet', 'devnet'])

compileConstants(path.join(__dirname, 'flow'), ['Mainnet', 'Testnet'])
