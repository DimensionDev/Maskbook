import { readFile, writeFile } from 'fs/promises'
import { watch } from 'gulp'
import { camelCase, snakeCase, upperFirst } from 'lodash-es'
import { parse as parsePath } from 'path'
import { PKG_PATH, ROOT_PATH, prettier, watchTask } from '../utils/index.js'
import type { Position } from 'source-map'
import { fileURLToPath } from 'url'

const pattern = 'packages/icons/**/*.@(svg|jpe?g|png)'
const iconRoot = new URL('icons/', PKG_PATH)
const CODE_FILE = fileURLToPath(new URL('icon-generated-as', iconRoot))

const dynamicColorRe = /(?:\w=('|")currentColor\1|var\(--icon-color)/

const attr2KeyValue = (attr: string) => {
    const index = attr.indexOf(':')
    return [attr.slice(0, index).trim(), attr.slice(index + 1).trim()]
}
function svg2jsx(code: string) {
    return code
        .trim()
        .replace(/(\w+-\w+)=('|").*?\2/g, (p: string, m1: string) => {
            return p.replace(m1, camelCase(m1))
        })
        .replaceAll('xlink:href', 'xlinkHref')
        .replace(/\bstyle=('|")(.+?)\1/g, (_p: string, _m1: string, style: string) => {
            const attributes = style
                .split(';')
                .map(attr2KeyValue)
                .map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`)
                .join(',')
            return `style={{${attributes}}}`
        })
}
function getIntrinsicSize(data: string | Buffer): [number, number] | undefined {
    if (typeof data === 'string') {
        // from `viewBox="0 0 2124 660"`, we match `2124 / 660` out.
        const match = data.match(/viewBox="0 0 (\d+) (\d+)"/)
        if (match) {
            return [parseFloat(match[1]), parseFloat(match[2])]
        }
    }
    // TODO: support binary image.
    return undefined
}

function getBase(fileName: string) {
    return fileName.split('.')[0]
}
function getVariant(fileName: string) {
    const variants = fileName.split('.').slice(1)
    return variants
}
const voidMapping: Position = { line: 1, column: 0 }
const exportConst = 'export const '.length
const SOURCEMAP_HEAD = '//# sourceMappingURL='

async function generateIcons() {
    const { SourceMapGenerator } = await import('source-map')
    const { transform } = await import('@swc/core')
    const { glob } = await import('glob')
    const asJSX = {
        js: [
            //
            `import { __createIcon } from './utils/internal.js'`,
        ],
        dts: [
            //
            `import type { GeneratedIconProps, GeneratedIconNonSquareProps } from './utils/internal.js'`,
            `import type { ComponentType } from 'react'`,
        ],
        dtsMap: new SourceMapGenerator({ file: 'icon-generated-as-jsx.d.ts' }),
    }
    const asURL = {
        js: [] as string[],
        dts: [] as string[],
        dtsMap: new SourceMapGenerator({ file: 'icon-generated-as-url.d.ts' }),
    }

    const relativePrefix = iconRoot.toString().length
    /* cspell:disable-next-line */
    const filePaths = await glob(pattern, { cwd: ROOT_PATH, nodir: true })

    const variants: Record<
        string,
        Array<{
            args: [currentVariant: string[], url: string, jsx: string | null, isColorful?: boolean]
            assetPath: string
        }>
    > = Object.create(null)

    const sourceMap = new Map<string, string | null>()
    await Promise.all(
        filePaths.map(async (path) => {
            const { ext } = parsePath(path)
            const code = ext.toLowerCase() === '.svg' ? await readFile(path, 'utf8') : ''
            const isDynamicColor = code ? dynamicColorRe.test(code) : false
            const source = isDynamicColor ? svg2jsx(code) : null
            if (source) sourceMap.set(path, source)
        }),
    )

    // Process in order of files
    filePaths
        .sort((a, z) => a.localeCompare(z, 'en-US'))
        .forEach((path) => {
            const { name } = parsePath(path)

            const base = getBase(name)
            const currentVariant = getVariant(name)
            variants[base] ??= []

            // cross platform, use URL to calculate relative path
            const importPath = './' + new URL(path, ROOT_PATH).toString().slice(relativePrefix)
            const identifier = importPath.includes('countries') ? `countries_${snakeCase(name)}` : snakeCase(name)

            const url = `new URL(${JSON.stringify(importPath)}, import.meta.url).href`
            asURL.js.push(`export function ${identifier}_url() { return ${url} }`)

            let currentLine = `/** ${createLink(importPath)} !${createLink(importPath)} */ export const `
            asURL.dtsMap.addMapping({
                generated: { line: asURL.js.length + 1, column: currentLine.length },
                original: voidMapping,
                source: importPath,
            })
            currentLine += `${identifier}_url: () => string`
            asURL.dts.push(currentLine)

            const isDynamicColor = sourceMap.has(path)
            const source = isDynamicColor ? sourceMap.get(path)! : null
            variants[base].push({
                args: [currentVariant, url, source, isDynamicColor],
                assetPath: importPath,
            })
        })

    for (const [icon, variant] of Object.entries(variants)) {
        const Ident = upperFirst(icon.replace(/\.(\w)/, (_, c: string) => c.toUpperCase()))
        const nameField = JSON.stringify(icon)
        const variantsField = variant
            .sort((a, b) => a.args[0].length - b.args[0].length)
            .map((x) => x.args)
            .map(([variant, url, jsx, isColorful]) => {
                return (
                    `{` +
                    [
                        variant.length === 0 ? null : `c: ${JSON.stringify(variant.sort())}`,
                        variant.length === 0 && jsx ? null : `u: () => ${url}`,
                        jsx ? `j: () => ${jsx}` : null,
                        isColorful ? 's: true' : null,
                    ]
                        .filter(Boolean)
                        .join(', ') +
                    '}'
                )
            })
            .join(', ')
        const intrinsicSize = getIntrinsicSize(variant.find((x) => x.args[2])?.args[2] || '')
        const args = [nameField, `[${variantsField}]`] as any[]
        const notSquare = intrinsicSize && intrinsicSize[0] !== intrinsicSize[1]
        if (notSquare) args.push(`[${intrinsicSize[0]}, ${intrinsicSize[1]}]`)
        asJSX.js.push(`export const ${Ident} = /*#__PURE__*/ __createIcon(${args.join(', ')})`)

        const variantNames = [...new Set(variant.flatMap((x) => x.args[0]))].map((x) => JSON.stringify(x))

        const jsdoc = [] as string[]
        if (variant.some((x) => x.args[3])) jsdoc.push('🎨 This icon supports custom color.')
        else jsdoc.push('🖼️ This icon brings its own colors.')

        jsdoc.push(`| Variant | Link | Preview |`)
        jsdoc.push(`| ------- | ---- | ------- |`)
        for (const { args, assetPath } of variant) {
            jsdoc.push(`| ${args[0].join(', ') || 'default'} | ${createLink(assetPath)} | !${createLink(assetPath)} |`)
        }

        // export const T: ...
        attachJSDoc(jsdoc, asJSX.dts)
        asJSX.dts.push(
            `export const ${Ident}: ComponentType<${notSquare ? 'GeneratedIconNonSquareProps' : 'GeneratedIconProps'}<${
                variantNames.join(' | ') || 'never'
            }>>`,
        )
        asJSX.dtsMap.addMapping({
            generated: { line: asJSX.dts.length, column: exportConst },
            original: voidMapping,
            source: variant[0].assetPath,
        })
        asJSX.dtsMap.addMapping({
            generated: { line: asJSX.dts.length, column: exportConst + Ident.length },
            original: voidMapping,
            source: 'null',
        })
    }
    asURL.dts.push(SOURCEMAP_HEAD + 'icon-generated-as-url.d.ts.map')
    asJSX.dts.push(SOURCEMAP_HEAD + 'icon-generated-as-jsx.d.ts.map')

    await Promise.all([
        writeFile(CODE_FILE + '-url.js', asURL.js.join('\n')),
        writeFile(CODE_FILE + '-url.d.ts', asURL.dts.join('\n')),
        writeFile(CODE_FILE + '-url.d.ts.map', asURL.dtsMap.toString()),

        transform(asJSX.js.join('\n'), {
            jsc: {
                parser: { jsx: true, syntax: 'ecmascript' },
                transform: { react: { useBuiltins: true, runtime: 'automatic' } },
                target: 'es2022',
            },
        })
            .then((result) => prettier(result.code))
            .then((code) => writeFile(CODE_FILE + '-jsx.js', code)),
        writeFile(CODE_FILE + '-jsx.d.ts', asJSX.dts.join('\n')),
        writeFile(CODE_FILE + '-jsx.d.ts.map', asJSX.dtsMap.toString()),
    ])
}
function attachJSDoc(jsdoc: readonly string[], lines: string[]) {
    return `/**\n${jsdoc.map((x) => ' * ' + x + '\n').join('')} */`.split('\n').forEach((x) => lines.push(x))
}
function createLink(x: string) {
    // Cannot render images in JSDoc in VSCode by relative path
    // Blocked by: https://github.com/microsoft/TypeScript/issues/47718
    //             https://github.com/microsoft/vscode/issues/86564
    const absolutePath = new URL(x, iconRoot)
    return `[${x.replace(/^\./, 'packages/icons')}](${absolutePath})`
}

export async function iconCodegen() {
    await generateIcons()
}

export async function iconCodegenWatch() {
    iconCodegen()
    watch(pattern, iconCodegen)
}

watchTask(iconCodegen, iconCodegenWatch, 'icon-codegen', 'Generate icons')
