import { runCli as startI18NCodeGenCli } from '@magic-works/i18n-codegen'
import { ROOT_PATH, watchTask } from '../utils'
import { resolve } from 'path'

const config = resolve(ROOT_PATH, '.i18n-codegen.json')
export async function i18nCodegen() {
    return startI18NCodeGenCli({ config }, console.error)
}
export async function i18nCodegenWatch() {
    startI18NCodeGenCli({ config, watch: true }, console.error)
}
watchTask(i18nCodegen, i18nCodegenWatch, 'i18n-codegen', 'Run i18n codegen')
