import * as path from 'path'
import * as fs from 'fs'
import { src, watch } from 'gulp'
import { prettier, ROOT_PATH, watchTask } from '../utils'
import glob from 'glob-promise'
import { camelCase } from 'lodash-unified'

const pattern = 'packages/icons/**/*.@(svg|jpe?g|png)'
const iconRoot = path.resolve(__dirname, '../../../icons')
const CODE_FILE = path.resolve(iconRoot, 'icon-data.ts')

const currentColorRe = /\w=('|")currentColor\1/

const hasCurrentColor = (code: string) => currentColorRe.test(code)

function optimizeSvg(code: string) {
    return (
        code
            .trim()
            // set both height and width to 100%, let svg's container, aka <Icon />, decide the size
            // We don't use g flag here, because we only want to change the first attribute of each
            .replace(/\b(height)=('|")\d+\2/, '$1="100%"')
            .replace(/\b(width)=('|")\d+\2/, '$1="100%"')
    )
}

export async function generateIcons() {
    const nameMap: Record<string, string> = {}
    const iconsWithDynamicColor: string[] = []
    const lines: string[] = []
    const names: string[] = []

    const filePaths = await glob.promise(pattern, { cwd: ROOT_PATH, nodir: true })
    filePaths.forEach((filePath) => {
        const parsed = path.parse(filePath)
        const fileName = parsed.base
        const name = camelCase(parsed.name)
        if (name.toLowerCase() === 'redpacket') {
            return
        }
        names.push(name)
        nameMap[name] = fileName
        const isSvg = parsed.ext.toLowerCase() === '.svg'
        const code = isSvg ? fs.readFileSync(filePath, 'utf8') : ''
        if (isSvg && hasCurrentColor(code)) {
            iconsWithDynamicColor.push(name)
            lines.push(`export const ${name}Icon = ${JSON.stringify(optimizeSvg(code))}`)
        } else {
            const importPath = path.relative(iconRoot, path.join(ROOT_PATH, filePath))
            console.log('from', iconRoot)
            console.log('to', path.join(ROOT_PATH, filePath))
            console.log('importPath', importPath)
            lines.push(`export const ${name}Icon = new URL("./${importPath}", import.meta.url).href`)
        }
    })

    const declareType = `export type IconType = ${names.map((n) => JSON.stringify(n)).join(' | ')}`
    const map = `export const iconNameMap = ${JSON.stringify(nameMap)}`
    const defaultExport = `const icons = {
    ${names.map((name) => `${name}:${name}Icon`).join(',')}
  }
  export default icons`

    return `
  ${declareType}
  ${map}
  ${lines.join('\n')}

  export const iconsWithDynamicColor = ${JSON.stringify(iconsWithDynamicColor)}

  ${defaultExport}`
}

async function generate() {
    const code = await generateIcons()
    const prettied = await prettier(code)

    console.log('Writing to', CODE_FILE)
    fs.writeFileSync(CODE_FILE, prettied)
}

export async function generateIconsTask() {
    await generate()
}

export async function generateIconsWatchTask() {
    watch(pattern, generateIconsTask)
}

watchTask(generateIconsTask, generateIconsWatchTask, 'icon-codegen', 'Generate icons')
