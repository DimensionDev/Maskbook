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

files.forEach((file) => {
    let code = readfile(file)
    if (!code.includes('= createIcon(')) return
    const firstBracket = code.indexOf('<')
    const lastBracket = code.lastIndexOf('>') + 1
    const viewport = code.slice(lastBracket).match(/\d+ \d+ (\d+) (\d+)/)
    const width = viewport[1]
    const height = viewport[2]
    code = code.slice(firstBracket, lastBracket)
    code = code.replace(/(\w+[A-Z]\w+)=/gm, (p, m) => {
        const to = `${kebabCase(m)}=`
        return to
    })
    if (code.startsWith('<>') && code.endsWith('</>')) {
        code = code.slice('<>'.length).slice(0, -'</>'.length).trim()
    }
    code = `<svg width="${width}" height="${height}" viewBox="${viewport[0]}" fill="none" xmlns="http://www.w3.org/2000/svg">
${code}
</svg>
  `

    writefile(file.replace(/\.tsx/, '.svg'), code)
})
