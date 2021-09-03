import { promises as fs } from 'fs'
import path from 'path'
import { runTypeChain, glob } from 'typechain'
import { run } from './utils'

const ABIS_PATH = path.join(__dirname, 'abis')
const GENERATED_PATH = path.join(__dirname, 'types')

async function replaceFileAll(file: string, pairs: [string, string][]) {
    let content = await fs.readFile(file, 'utf-8')
    for (const [pattern, value] of pairs) {
        content = content.replace(new RegExp(pattern, 'img'), value)
    }
    await fs.writeFile(file, content, 'utf-8')
}

async function main() {
    const cwd = process.cwd()
    // find all files matching the glob
    const allFiles = glob(cwd, ['./abis/*.json'])

    await runTypeChain({
        cwd,
        filesToProcess: allFiles,
        allFiles,
        outDir: GENERATED_PATH,
        target: 'web3-v1',
    })

    // rename Qualification to QualificationEvent
    const qualificationDefinition = path.join(GENERATED_PATH, 'Qualification.d.ts')
    replaceFileAll(qualificationDefinition, [
        ['type Qualification', 'type QualificationEvent'],
        ['Callback<Qualification>', 'Callback<QualificationEvent>'],
    ])

    // format code
    run(GENERATED_PATH, 'npx', 'prettier', '.', '--write')

    // add to git stage
    run(ABIS_PATH, 'git', 'add', '.')
    run(GENERATED_PATH, 'git', 'add', '.')
}

main()
