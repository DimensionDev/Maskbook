import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { ROOT_PATH, shell } from '../utils'
import { prettier } from '../utils/prettier'
import { task } from '../utils'

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

function sort(values: string[] = []) {
    values = [...new Set(values)]
    values.sort((a, b) => a.localeCompare(b, 'en-US', { numeric: true }))
    if (values.length === 0) return
    return values
}

function sortConfigure(configure: Configure) {
    configure.ignorePaths = sort(configure.ignorePaths)
    configure.words = sort(configure.words?.map(toLowerCase))
    configure.ignoreWords = sort(configure.ignoreWords?.map(toLowerCase))
}

function toLowerCase(input: string) {
    return input.toLowerCase()
}

export async function reorderSpellcheck() {
    const configure: RootConfigure = JSON.parse(await readFile(CONFIGURE_PATH, 'utf-8'))
    sortConfigure(configure)
    configure.overrides?.forEach(sortConfigure)
    const formatted = await prettier(JSON.stringify(configure, null, 2), 'json')
    await writeFile(CONFIGURE_PATH, formatted, 'utf-8')
}

task(reorderSpellcheck, 'reorder-spellcheck', 'Run Spellcheck reorder words.')

export async function spellcheck() {
    await reorderSpellcheck()
    return shell`cspell lint --no-must-find-files --no-progress --relative 'packages/**/*'`
}

task(spellcheck, 'spellcheck', 'Run Spellcheck')
