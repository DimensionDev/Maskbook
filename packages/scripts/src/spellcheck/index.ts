import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { ROOT_PATH } from '../utils'
import { prettier } from '../utils/prettier'

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

function localeCompare(a: string, b: string) {
    return a.localeCompare(b, 'en-US', { numeric: true })
}

function sortConfigure(configure: Configure) {
    configure.ignorePaths?.sort(localeCompare)
    configure.words?.sort(localeCompare)
    configure.ignoreWords?.sort(localeCompare)
}

export async function reorderSpellcheck() {
    const configure: RootConfigure = JSON.parse(await readFile(CONFIGURE_PATH, 'utf-8'))
    sortConfigure(configure)
    configure.overrides?.forEach(sortConfigure)
    const formatted = await prettier(JSON.stringify(configure, null, 2), 'json')
    await writeFile(CONFIGURE_PATH, formatted, 'utf-8')
}
