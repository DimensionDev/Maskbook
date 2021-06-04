/* eslint-disable no-restricted-imports */
import { promises as fs, readdirSync } from 'fs'
import { difference, keys, uniq, without } from 'lodash'
import { resolve, relative } from 'path'
import { getUsedKeys } from './ast'
import { ROOT_PATH, PKG_PATH } from '../utils'

const SOURCE_PATH = resolve(PKG_PATH, 'maskbook', 'src')
export const LOCALE_PATH = resolve(SOURCE_PATH, '_locales')
// only allow ISO 639-1 two-letter code for locale directory name
export const LOCALE_NAMES = readdirSync(LOCALE_PATH).filter((name) => /^[a-z]{2}$/.test(name))

export function getMessagePath(name: string) {
    return resolve(LOCALE_PATH, name, 'messages.json')
}

export function getLocaleRelativePath(...paths: string[]) {
    return relative(ROOT_PATH, resolve(LOCALE_PATH, ...paths))
}

export async function readMessages(name: string) {
    return JSON.parse(await fs.readFile(getMessagePath(name), 'utf-8'))
}

export async function writeMessages(name: string, messages: unknown) {
    await fs.writeFile(getMessagePath(name), JSON.stringify(messages, null, 4) + '\n', 'utf-8')
}

export async function findAllUsedKeys() {
    const usedKeys: string[] = []
    for await (const file of walk(SOURCE_PATH)) {
        usedKeys.push(...getUsedKeys(await fs.readFile(file, 'utf-8')))
    }
    return uniq(usedKeys)
}

export async function findAllUnusedKeys() {
    return difference(keys(await readMessages('en')), await findAllUsedKeys())
}

export async function findAllUnsyncedLocales(locales = without(LOCALE_NAMES, 'en')) {
    const names = keys(await readMessages('en'))
    const record: Record<string, string[]> = {}
    for (const name of locales) {
        const nextKeys = keys(await readMessages(name))
        const diffKeys = difference(names, nextKeys)
        if (diffKeys.length) {
            record[name] = diffKeys
        }
    }
    return record
}

async function* walk(dir: string): AsyncIterableIterator<string> {
    for await (const dirent of await fs.opendir(dir)) {
        const entry = resolve(dir, dirent.name)
        if (dirent.isDirectory()) {
            yield* walk(entry)
        } else if (dirent.isFile() && /\.(tsx?)$/.test(entry)) {
            yield entry
        }
    }
}
