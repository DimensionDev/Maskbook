import { readFile, writeFile } from 'fs/promises'
import glob from 'glob-promise'
import { watch } from 'gulp'
import { camelCase, snakeCase, upperFirst } from 'lodash-unified'
import { parse as parsePath, join, resolve } from 'path'
import { pathToFileURL } from 'url'
import { ROOT_PATH, watchTask } from '../utils'
import { transform } from '@swc/core'

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
    )
}
function getIntrinsicSize(data: string | Buffer) {
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

async function generateIcons() {
    const asJSX = {
        js: [
            //
            `import { __createIcon } from './utils/internal.js'`,
        ],
        dts: [
            //
            `import type { GeneratedIconProps } from './utils/internal.js'`,
            `import type { ComponentType } from 'react'`,
        ],
    }
    const asURL = { js: [] as string[], dts: [] as string[] }

    const relativePrefix = pathToFileURL(iconRoot).toString().length + 1
    const filePaths = await glob.promise(pattern, { cwd: ROOT_PATH, nodir: true })

    const variants: Record<
        string,
        Array<[currentVariant: string[], url: string, jsx: string | null, isColorful?: boolean]>
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
            asURL.dts.push(`export const ${identifier}_url: string`)

            const source = parsedPath.ext.toLowerCase() === '.svg' ? await readFile(path, 'utf8').then(svg2jsx) : null
            variants[base].push([currentVariant, url, source, !!source?.match(currentColorRe)])
        }),
    )

    for (const [icon, variant] of Object.entries(variants)) {
        const Ident = upperFirst(camelCase(icon))
        const nameField = JSON.stringify(icon)
        const variantsField = variant
            .sort((a, b) => a[0].length - b[0].length)
            .map(([variant, url, jsx, isColorful]) => {
                return `[${variant.length === 0 ? null : JSON.stringify(variant.sort())}, ${url}, ${jsx ?? 'null'}, ${
                    isColorful ? 'true' : ''
                }]`
            })
            .join(', ')
        const intrinsicSize = getIntrinsicSize(variant.find((x) => x[2])?.[2] || '')
        const args = [nameField, `[${variantsField}]`] as any[]
        if (intrinsicSize && intrinsicSize[0] !== intrinsicSize[1])
            args.push(`[${intrinsicSize[0]}, ${intrinsicSize[1]}]`)
        asJSX.js.push(`export const ${Ident} = /*#__PURE__*/ __createIcon(${args.join(', ')})`)

        const variantNames = [...new Set(variant.flatMap((x) => x[0]))].map((x) => JSON.stringify(x))
        asJSX.dts.push(
            `export const ${Ident}: ComponentType<GeneratedIconProps<${variantNames.join(' | ') || 'never'}>>`,
        )
    }

    await Promise.all([
        writeFile(CODE_FILE + '-url.js', asURL.js.join('\n')),
        writeFile(CODE_FILE + '-url.d.ts', asURL.dts.join('\n')),

        transform(asJSX.js.join('\n'), {
            jsc: {
                parser: { jsx: true, syntax: 'ecmascript' },
                transform: { react: { useBuiltins: true, runtime: 'automatic' } },
                target: 'es2021',
            },
        }).then(({ code }) => writeFile(CODE_FILE + '-jsx.js', code)),
        writeFile(CODE_FILE + '-jsx.d.ts', asJSX.dts.join('\n')),
    ])
}

export async function iconCodegen() {
    await generateIcons()
}

export async function iconCodegenWatch() {
    iconCodegen()
    watch(pattern, iconCodegen)
}

watchTask(iconCodegen, iconCodegenWatch, 'icon-codegen', 'Generate icons')
