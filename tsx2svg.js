const fs = require('fs')
const glob = require('glob-promise')
const files = glob.sync('packages/icons/**/*.tsx')
const kebabCase = require('lodash/kebabCase')

const readfile = (file) => {
    return fs.readFileSync(file, 'utf8')
}

const writefile = (file, content) => {
    fs.writeFileSync(file, content)
}

function converAttr(code) {
    return code.replace(/(\w+[A-Z]\w+)=/gm, (p, m) => {
        const to = `${kebabCase(m)}=`
        return to
    })
}

function removeFragment(code) {
    if (code.startsWith('<>') && code.endsWith('</>')) {
        return code.slice('<>'.length).slice(0, -'</>'.length).trim()
    }
    return code
}

function armSvg(code, width, height, viewBox) {
    return `<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
${code}
</svg>
  `
}

function processCode(code, width, height, viewBox) {
    code = converAttr(code)
    code = removeFragment(code)
    code = armSvg(code, width, height, viewBox)
    return code
}

function handleNormalIcon(code, name) {
    const firstBracket = code.indexOf('<')
    const lastBracket = code.lastIndexOf('>') + 1
    const viewport = code.slice(lastBracket).match(/-?\d+ -?\d+ (-?\d+) (-?\d+)/)
    const width = viewport[1]
    const height = viewport[2]
    code = code.slice(firstBracket, lastBracket)
    code = processCode(code, width, height, viewport[0])

    writefile(`${name}.svg`, code)
}

const responseIconMark = '= createPaletteAwareIcon('
function handleResponseIcon(code, name) {
    const firstRoundBracket = code.indexOf(responseIconMark)
    const lastRoundBracket = code.lastIndexOf(')') + 1
    const lastBracket = code.lastIndexOf('>') + 1
    let [_, lightCode, darkCode, dimCode] = code
        .slice(firstRoundBracket, lastRoundBracket)
        .split(',\n')
        .map((v) => v.trim())

    const viewport = code.slice(lastBracket).match(/-?\d+ -?\d+ (-?\d+) (-?\d+)/)
    const width = viewport[1]
    const height = viewport[2]

    if (lightCode) {
        lightCode = processCode(lightCode, width, height, viewport[0])
        writefile(`${name}.svg`, lightCode)
    }

    if (darkCode && darkCode !== 'undefined') {
        darkCode = processCode(darkCode, width, height, viewport[0])
        writefile(`${name}.dark.svg`, darkCode)
    }

    if (dimCode && dimCode !== 'undefined') {
        dimCode = processCode(dimCode, width, height, viewport[0])
        writefile(`${name}.dim.svg`, dimCode)
    }
}

files.forEach((file) => {
    try {
        const code = readfile(file)
        const name = file.replace(/\.tsx/, '')
        if (code.includes('= createIcon(')) {
            handleNormalIcon(code, name)
        } else if (code.includes(responseIconMark)) {
            handleResponseIcon(code, name)
        }
    } catch (err) {
        console.log(err)
        console.log(file)
    }
})
