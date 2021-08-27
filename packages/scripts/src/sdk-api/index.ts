import { join } from 'path'
import { awaitChildProcess, ROOT_PATH, shell, task } from '../utils'

export async function buildSDKSite() {
    const sdk = join(ROOT_PATH, 'packages/mask-sdk/')
    await awaitChildProcess(shell.cwd(ROOT_PATH)`npx tsc -b ./packages/mask-sdk/public-api/`)
    await awaitChildProcess(shell.cwd(sdk)`npx api-extractor run --local --verbose`)
    await awaitChildProcess(
        shell.cwd(
            sdk,
        )`npx api-documenter yaml --input-folder ./dist/api-doc-model/ --output-folder ./docfx_project/dist/yaml`,
    )
    console.log('Run the following command to preview:')
    console.log('$ docfx ./packages/mask-sdk/docfx_project/docfx.json --serve')
}
task(buildSDKSite, 'build-sdk-site', 'Build site for Mask SDK')
