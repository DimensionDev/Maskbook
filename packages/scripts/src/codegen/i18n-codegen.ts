import { fileURLToPath } from 'url'
import { ROOT_PATH, watchTask } from '../utils/index.js'

const config = fileURLToPath(new URL('.i18n-codegen.json', ROOT_PATH))
export async function i18nCodegen() {
    const { runCli } = await import('@magic-works/i18n-codegen')
    return runCli({ config }, console.error)
}
export async function i18nCodegenWatch() {
    const { runCli } = await import('@magic-works/i18n-codegen')
    runCli({ config, watch: true }, console.error)
}
watchTask(i18nCodegen, i18nCodegenWatch, 'i18n-codegen', 'Run i18n codegen')
