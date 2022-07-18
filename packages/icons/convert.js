import { readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import prettier from 'prettier'

const folder = async (s) => {
    return (await readdir(new URL(s, import.meta.url)))
        .filter((x) => !x.includes('index'))
        .map((x) => new URL(`${s}/${x}`, import.meta.url))
}
const files = [
    await folder('./brands'),
    await folder('./menus'),
    await folder('./plugins'),
    await folder('./settings'),
    await folder('./general'),
]
    .flat()
    .map((x) => ({ data: readFile(x, 'utf-8'), path: x }))

const printer = ts.createPrinter({})

for (const { data, path } of files) {
    if (!path.toString().endsWith('.tsx')) continue
    const content = await data
    const file = ts.createSourceFile(path.toString(), content, ts.ScriptTarget.ESNext, true)

    /** @type {ts.CallExpression} */
    let fnCall
    /**
     * @param {ts.Node} node
     */
    function visitor(node) {
        if (ts.isCallExpression(node)) {
            fnCall = node
        } else {
            return ts.forEachChild(node, visitor)
        }
    }
    visitor(file)
    if (!fnCall) continue

    const isPalette = fnCall.expression.getText() === 'createPaletteAwareIcon'
    if (isPalette) {
        const svgLight = fnCall.arguments[1]
        const svgDark = fnCall.arguments[2]
        const svgDim = fnCall.arguments[3]
        const size = fnCall.arguments[4]

        const svgLightPath = fileURLToPath(path).replace('.tsx', '.light.svg')
        const svgDarkPath = fileURLToPath(path).replace('.tsx', '.dark.svg')
        const svgDimPath = fileURLToPath(path).replace('.tsx', '.dim.svg')

        await createFile(svgLightPath, svgLight, size)
        await createFile(svgDarkPath, svgDark, size)
        await createFile(svgDimPath, svgDim, size)
        await unlink(path)
    } else {
        const svg = fnCall.arguments[1]
        const size = fnCall.arguments[2]

        await createFile(fileURLToPath(path).replace('.tsx', '.svg'), svg, size)
        await unlink(path)
    }

    async function createFile(path, svg, size) {
        console.log(path)
        const content = printer
            .printNode(ts.EmitHint.Expression, svg, file)
            .replaceAll('colorInterpolationFilters', 'color-interpolation-filters')
            .replaceAll('floodOpacity', 'flood-opacity')
            .replaceAll(' clipPath=', ' clip-path=')
            .replaceAll('fillRule', 'fill-rule')
            .replaceAll('clipRule', 'clip-rule')
            .replaceAll('xlinkHref', 'xlink:href')
            .replaceAll('stopColor', 'stop-color')
            .replaceAll('stopOpacity', 'stop-opacity')
            .replaceAll('strokeWidth', 'stroke-width')
            .replaceAll('strokeLinecap', 'stroke-linecap')
            .replaceAll('strokeLinejoin', 'stroke-linejoin')
            .replaceAll('<>', '')
            .replaceAll('</>', '')
        if (content === 'undefined') return
        if (!ts.isStringLiteralLike(size)) return

        const f = `<svg viewBox="${size.text}" xmlns="http://www.w3.org/2000/svg">\n` + content + '\n</svg>'
        await writeFile(
            path,
            prettier.format(f, {
                parser: 'html',
                trailingComma: 'all',
                printWidth: 120,
                semi: false,
                singleQuote: true,
                tabWidth: 4,
            }),
        )
    }
}
