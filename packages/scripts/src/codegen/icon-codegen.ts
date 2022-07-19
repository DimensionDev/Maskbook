import { readFile, writeFile } from 'fs/promises'
import glob from 'glob-promise'
import { watch } from 'gulp'
import { camelCase, snakeCase, upperFirst } from 'lodash-unified'
import { parse as parsePath, join, resolve } from 'path'
import { pathToFileURL } from 'url'
import { ROOT_PATH, watchTask } from '../utils'
import { transform } from '@swc/core'
import { Position, SourceMapGenerator } from 'source-map'

const pattern = 'packages/icons/**/*.@(svg|jpe?g|png)'
const iconRoot = resolve(__dirname, '../../../icons')
const CODE_FILE = resolve(iconRoot, 'icon-generated-as')

const currentColorRe = /\w=('|")currentColor\1/

function svg2jsx(code: string) {
    return (
        code
            .trim()
            // set height and width to 100%, let the container <Icon /> of svg decide the size.
            // Don't use the g flag here, because we only want to change the first attribute of each
            .replace(/\b(height)=('|")\d+\2/, '')
            .replace(/\b(width)=('|")\d+\2/, '')
            .replace(/(\w+-\w+)=('|").*?\2/g, (p: string, m1: string) => {
                return p.replace(m1, camelCase(m1))
            })
            .replaceAll('xlink:href', 'xlinkHref')
    )
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

    const relativePrefix = pathToFileURL(iconRoot).toString().length + 1
    /* cspell:disable-next-line */
    const filePaths = await glob.promise(pattern, { cwd: ROOT_PATH, nodir: true })

    const variants: Record<
        string,
        Array<{
            args: [currentVariant: string[], url: string, jsx: string | null, isColorful?: boolean]
            assetPath: string
        }>
    > = Object.create(null)

    await Promise.all(
        filePaths.map(async (path) => {
            const parsedPath = parsePath(path)

            const base = getBase(parsedPath.name)
            const currentVariant = getVariant(parsedPath.name)
            variants[base] ??= []

            // cross platform, use URL to calculate relative path
            const importPath = './' + pathToFileURL(join(ROOT_PATH, path)).toString().slice(relativePrefix)
            const identifier = snakeCase(parsedPath.name)

            const url = ` /*#__PURE__*/ (new URL(${JSON.stringify(importPath)}, import.meta.url).href)`
            asURL.js.push(`export const ${identifier}_url = ${url}`)

            let currentLine = `/** ${createImage(importPath)} */ export const `
            asURL.dtsMap.addMapping({
                generated: { line: asURL.js.length + 1, column: currentLine.length },
                original: voidMapping,
                source: importPath,
            })
            currentLine += `${identifier}_url: string`
            asURL.dts.push(currentLine)

            const source = parsedPath.ext.toLowerCase() === '.svg' ? await readFile(path, 'utf8').then(svg2jsx) : null
            variants[base].push({
                args: [currentVariant, url, source, !!source?.match(currentColorRe)],
                assetPath: importPath,
            })
        }),
    )

    for (const [icon, variant] of Object.entries(variants)) {
        const Ident = upperFirst(camelCase(icon))
        const nameField = JSON.stringify(icon)
        const variantsField = variant
            .sort((a, b) => a.args[0].length - b.args[0].length)
            .map((x) => x.args)
            .map(([variant, url, jsx, isColorful]) => {
                return `[${variant.length === 0 ? null : JSON.stringify(variant.sort())}, ${url}, ${jsx ?? 'null'}, ${
                    isColorful ? 'true' : ''
                }]`
            })
            .join(', ')
        const intrinsicSize = getIntrinsicSize(variant.find((x) => x.args[2])?.args[2] || '')
        const args = [nameField, `[${variantsField}]`] as any[]
        const notSquare = intrinsicSize && intrinsicSize[0] !== intrinsicSize[1]
        if (notSquare) args.push(`[${intrinsicSize[0]}, ${intrinsicSize[1]}]`)
        asJSX.js.push(`export const ${Ident} = /*#__PURE__*/ __createIcon(${args.join(', ')})`)
        if (!Ident.endsWith('Icon')) asJSX.js.push(`export const ${Ident}Icon = ${Ident}`)

        const variantNames = [...new Set(variant.flatMap((x) => x.args[0]))].map((x) => JSON.stringify(x))

        const jsdoc = [] as string[]
        if (variant.some((x) => x.args[3])) jsdoc.push('🎨 This icon supports custom color.')
        else jsdoc.push('🖼️ This icon brings its own colors.')

        for (const { args, assetPath } of variant) {
            if (variant.length !== 1) jsdoc.push(`Variant: ${args[0].join(', ')}`)

            jsdoc.push(createImage(assetPath))
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

        // export const TIcon: ...
        if (!Ident.endsWith('Icon')) {
            jsdoc.push(`@deprecated use \`${Ident}\` instead`)
            attachJSDoc(jsdoc, asJSX.dts)
            asJSX.dts.push(`export const ${Ident}Icon: typeof ${Ident}`)
            asJSX.dtsMap.addMapping({
                generated: { line: asJSX.dts.length, column: exportConst },
                original: voidMapping,
                source: variant[0].assetPath,
            })
            asJSX.dtsMap.addMapping({
                generated: { line: asJSX.dts.length, column: exportConst + Ident.length + 4 },
                original: voidMapping,
                source: 'null',
            })
        }
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
                target: 'es2021',
            },
        }).then(({ code }) => writeFile(CODE_FILE + '-jsx.js', code)),
        writeFile(CODE_FILE + '-jsx.d.ts', asJSX.dts.join('\n')),
        writeFile(CODE_FILE + '-jsx.d.ts.map', asJSX.dtsMap.toString()),
    ])
}
function attachJSDoc(jsdoc: readonly string[], lines: string[]) {
    return `/**\n${jsdoc.map((x) => ' * ' + x + '\n').join('\n')}\n */`.split('\n').forEach((x) => lines.push(x))
}
function createImage(x: string) {
    // Cannot render images in JSDoc in VSCode by relative path
    // Blocked by: https://github.com/microsoft/TypeScript/issues/47718
    //             https://github.com/microsoft/vscode/issues/86564
    const absolutePath = pathToFileURL(join(ROOT_PATH, './packages/icons/', x))
    return `[${x}](${absolutePath}) ![${x}](${absolutePath})`
}

export async function iconCodegen() {
    await generateIcons()
}

export async function iconCodegenWatch() {
    iconCodegen()
    watch(pattern, iconCodegen)
}

watchTask(iconCodegen, iconCodegenWatch, 'icon-codegen', 'Generate icons')
