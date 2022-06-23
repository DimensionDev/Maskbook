import * as fs from 'fs'
import glob from 'glob-promise'
import { watch } from 'gulp'
import { camelCase } from 'lodash-unified'
import * as path from 'path'
import { prettier, ROOT_PATH, watchTask } from '../utils'

const pattern = 'packages/icons/**/*.@(svg|jpe?g|png)'
const iconRoot = path.resolve(__dirname, '../../../icons')
const CODE_FILE = path.resolve(iconRoot, 'icon-data.tsx')

const currentColorRe = /\w=('|")currentColor\1/

const hasCurrentColor = (code: string) => currentColorRe.test(code)

function svg2jsx(code: string) {
    return (
        code
            .trim()
            // set both height and width to 100%, let svg's container, aka <Icon />, decide the size.
            // We don't use g flag here, because we only want to change the first attribute of each
            .replace(/\b(height)=('|")\d+\2/, '')
            .replace(/\b(width)=('|")\d+\2/, '')
            .replace(/(\w+-\w+)=('|").*?\2/g, (p: string, m1: string) => {
                return p.replace(m1, camelCase(m1))
            })
    )
}

const responseExtRe = /\.(light|dim|dark)$/
const responsiveNameRe = /(.*)\.(light|dim|dark)$/
function getIconName(fileName: string) {
    const name = fileName.match(responsiveNameRe)
        ? fileName.replace(responsiveNameRe, (_, m1, m2) => {
              if (m2 === 'light') return camelCase(m1)
              return `${camelCase(m1)}.${m2}`
          })
        : camelCase(fileName)
    return name
}
function getVarName(fileName: string) {
    const matched = fileName.match(responsiveNameRe)
    const name = matched ? camelCase(matched[0]) : ''
    return name
}

export async function generateIcons() {
    const iconsWithDynamicColor: string[] = []
    const lines: string[] = []
    const indexNames = new Set<string>()
    const iconVarNames = new Map<string, string>()
    const typeNames = new Set<string>()

    const filePaths = await glob.promise(pattern, { cwd: ROOT_PATH, nodir: true })
    filePaths.forEach((filePath) => {
        const parsed = path.parse(filePath)
        const name = getIconName(parsed.name)
        const varName = getVarName(parsed.name) || camelCase(name)
        indexNames.add(name)
        iconVarNames.set(name, `${varName}Icon`)
        if (name.match(responseExtRe)) {
            typeNames.add(name.replace(responseExtRe, ''))
        } else {
            typeNames.add(name)
        }
        const isSvg = parsed.ext.toLowerCase() === '.svg'
        const code = isSvg ? fs.readFileSync(filePath, 'utf8') : ''
        if (isSvg && hasCurrentColor(code)) {
            iconsWithDynamicColor.push(name)
            lines.push(`export const ${iconVarNames.get(name)} = ${svg2jsx(code)}`)
        } else {
            const importPath = path.relative(iconRoot, path.join(ROOT_PATH, filePath))
            lines.push(`export const ${iconVarNames.get(name)} = new URL("./${importPath}", import.meta.url).href`)
        }
    })

    const declareType = `export type IconType = ${Array.from(typeNames, (v) => JSON.stringify(v)).join(' | ')}`
    const defaultExport = `const icons = {
    ${Array.from(indexNames, (name) => `${JSON.stringify(name)}:${iconVarNames.get(name)}`).join(',')}
  }
  export default icons`

    return `
  ${declareType}
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

export async function iconCodegen() {
    await generate()
}

export async function iconCodegenWatch() {
    watch(pattern, iconCodegen)
}

watchTask(iconCodegen, iconCodegenWatch, 'icon-codegen', 'Generate icons')
