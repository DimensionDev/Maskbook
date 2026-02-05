import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { task } from '../utils/task.ts'
import { awaitChildProcess } from '../utils/awaitChildProcess.ts'
import { shell } from '../utils/run.ts'

const ABIS_PATH = join(import.meta.dirname, '../../../web3-contracts/abis/')
const GENERATED_PATH = join(import.meta.dirname, '../../../web3-contracts/types/')

export async function buildContracts() {
    const cwd = join(GENERATED_PATH, '../')
    const { glob, runTypeChain } = await import('typechain')
    // find all files matching the glob
    const allFiles = glob(cwd, ['./abis/*.json'])
    const abis = allFiles.map((file) => file.split('/').pop()!.replace('.json', ''))

    await fs.rmdir(GENERATED_PATH, { recursive: true })
    await runTypeChain({
        cwd,
        filesToProcess: allFiles,
        allFiles,
        outDir: GENERATED_PATH,
        target: 'web3-v1',
    })
    await awaitChildProcess(shell.cwd(GENERATED_PATH)`pnpm exec prettier . --write`)
    for (const file of await fs.readdir(GENERATED_PATH)) {
        const path = join(GENERATED_PATH, file)
        let content = await fs.readFile(path, 'utf-8')

        content = content.replaceAll("from './types'", "from './types.js'")
        if (file.includes('types.ts')) {
            content = content.replaceAll('web3-core/types', 'web3-core')
        }
        if (file.includes('index.ts')) {
            content = content.replaceAll("'\n", ".js'\n")
        }
        const abiName = file.slice(0, -3)
        if (abis.includes(abiName)) {
            content += `
// prettier-ignore
export type ${abiName}Abi = ${JSON.stringify(JSON.parse(await fs.readFile(join(ABIS_PATH, abiName + '.json'), 'utf-8')))}
export const ${abiName}Abi: ${abiName}Abi
`
            fs.writeFile(
                path.replace('.ts', '.js'),
                `export { default as ${abiName}Abi } from '../abis/${abiName}.json' with { type: 'json' }\n`,
            )
        }

        await fs.writeFile(path, content, 'utf-8')
        await fs.rename(path, path.replace('.ts', '.d.ts'))
    }
}
task(buildContracts, 'build-contracts', 'Build .d.ts files from ABI files')
