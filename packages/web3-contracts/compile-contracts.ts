import { promises as fs } from 'fs'
import { join } from 'path'
import { runTypeChain, glob } from 'typechain'
import { run } from './utils'

const ABIS_PATH = join(__dirname, 'abis')
const GENERATED_PATH = join(__dirname, 'types')

async function replaceFileAll(file: string, pairs: Array<[string, string]>) {
    let content = await fs.readFile(file, 'utf-8')
    for (const [pattern, value] of pairs) {
        // only replace once.
        // eslint-disable-next-line unicorn/prefer-string-replace-all
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
    const qualificationDefinition = join(GENERATED_PATH, 'Qualification.ts')
    replaceFileAll(qualificationDefinition, [
        ['type Qualification', 'type QualificationEvent'],
        ['Callback<Qualification>', 'Callback<QualificationEvent>'],
    ])

    run(GENERATED_PATH, 'npx', '-y', '@magic-works/ts-esm-migrate', '.')
    // format code
    run(GENERATED_PATH, 'npx', 'prettier', '.', '--write')
    // rename .ts to .d.ts
    for (const file of await fs.readdir(GENERATED_PATH)) {
        await fs.rename(join(GENERATED_PATH, file), join(GENERATED_PATH, file.replace('.ts', '.d.ts')))
    }

    // add to git stage
    run(ABIS_PATH, 'git', 'add', '.')
    run(GENERATED_PATH, 'git', 'add', '.')
}

main()
