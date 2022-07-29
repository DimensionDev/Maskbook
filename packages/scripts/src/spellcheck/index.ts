import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { prettier, ROOT_PATH, task } from '../utils'

const CONFIGURE_PATH = resolve(ROOT_PATH, 'cspell.json')

interface RootConfigure extends Configure {
    overrides?: Configure[]
}

interface Configure {
    filename?: string
    ignorePaths?: string[]
    words?: string[]
    ignoreWords?: string[]
}

function sort(values?: string[]) {
    if (!values) return
    values = values.map((value) => value.toLowerCase())
    values = [...new Set(values)]
    values.sort((a, b) => a.localeCompare(b, 'en-US', { numeric: true }))
    return values
}

function sortConfigure(configure: Configure) {
    configure.ignorePaths = sort(configure.ignorePaths)
    configure.words = sort(configure.words)
    configure.ignoreWords = sort(configure.ignoreWords)
}

export async function reorderSpellcheck() {
    const configure: RootConfigure = JSON.parse(await readFile(CONFIGURE_PATH, 'utf-8'))
    sortConfigure(configure)
    configure.overrides?.forEach(sortConfigure)
    const formatted = await prettier(JSON.stringify(configure, null, 2), 'json')
    await writeFile(CONFIGURE_PATH, formatted, 'utf-8')
}

task(reorderSpellcheck, 'reorder-spellcheck', 'Run Spellcheck reorder words.')
