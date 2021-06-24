import fs from 'fs'
import path from 'path'
import { run } from '../cli/utils'

const DATA_PATH = path.join(__dirname, 'data')
const INDEX_PAYH = path.join(__dirname, 'src', 'index.ts')

const files = fs.readdirSync(DATA_PATH)

const captialized = (x: string) => `${x.charAt(0).toUpperCase()}${x.substr(1)}`

async function main() {
    // complete constants
    files.forEach((x) => {
        const filePaths = path.resolve(DATA_PATH, x)
        const data = fs.readFileSync(filePaths).toString()

        try {
            const constants = JSON.parse(data)
            const validatedConstants = Object.keys(constants).reduce((accumulator, key) => {
                const value = Object.values(constants[key])[0]
                const typeOfValue = Array.isArray(value) ? 'array' : typeof value
                const defaultOfValue = (() => {
                    switch (typeOfValue) {
                        case 'string':
                            return ''
                        case 'number':
                            return 0
                        case 'boolean':
                            return false
                        case 'array':
                            return []
                        default:
                            return null
                    }
                })()
                accumulator[key] = {
                    Mainnet: constants[key]['Mainnet'] ?? defaultOfValue,
                    Ropsten: constants[key]['Ropsten'] ?? defaultOfValue,
                    Rinkeby: constants[key]['Rinkeby'] ?? defaultOfValue,
                    Kovan: constants[key]['Kovan'] ?? defaultOfValue,
                    Gorli: constants[key]['Gorli'] ?? defaultOfValue,
                    BSC: constants[key]['BSC'] ?? defaultOfValue,
                    BSCT: constants[key]['BSCT'] ?? defaultOfValue,
                    Matic: constants[key]['Matic'] ?? defaultOfValue,
                    Mumbai: constants[key]['Mumbai'] ?? defaultOfValue,
                }
                return accumulator
            }, {} as { [key: string]: any })

            fs.writeFileSync(filePaths, JSON.stringify(validatedConstants, null, 4))
        } catch (e) {
            console.log(`Error: failed to parse ${filePaths}. It's not a valid JSON file.`)
        }
    })

    // generate the index file
    const code = files
        .map((x) => {
            const filePath = path.resolve(DATA_PATH, x)
            const { name: fileName, ext: fileExt } = path.parse(filePath)

            return {
                path: filePath,
                name: fileName,
                ext: fileExt,
            }
        })
        .reduce(
            (code, data) => {
                if (data.ext.toLowerCase() !== '.json') return code
                const name = data.name.split(/[_-\s]+/).map(captialized).join('')
                const constantName = `${name.toUpperCase()}_CONSTANTS`
                const vallinaName = `get${captialized(name)}Constants`
                const hookName = `use${captialized(name)}Constants`
                code.push(`import ${constantName} from '../data/${data.name}${data.ext}'`)
                code.push(`export const ${vallinaName} = transform(${constantName})`)
                code.push(`export const ${hookName} = hookTransform(${vallinaName})`)
                code.push('')
                return code
            },
            [
                '/* THIS FILE WAS GENERATED AUTOMATICALLY. PLEASE DO NOT MODIFY IT DIRECTLY. */',
                '',
                `import { hookTransform, transform } from './utils'`,
                '',
            ],
        )

    fs.writeFileSync(INDEX_PAYH, code.join('\n'))

    // format files
    run(DATA_PATH, 'npx', 'prettier', '--write', '*')
    run(INDEX_PAYH, 'npx', 'prettier', '--write', '*')
}

main()
