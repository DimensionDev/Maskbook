/* eslint-disable no-restricted-imports */
import { promises as fs, readdirSync } from 'fs'
import { difference, keys, uniq, without } from 'lodash'
import * as path from 'path'
import { getUsedKeys } from './ast'

const SOURCE_PATH = path.join(__dirname, '..', 'maskbook', 'src')
export const LOCALE_PATH = path.join(SOURCE_PATH, '_locales')
export const LOCALE_NAMES = readdirSync(LOCALE_PATH)

export function getMessagePath(name: string) {
    return path.join(LOCALE_PATH, name, 'messages.json')
}

export function getLocaleRelativePath(...paths: string[]) {
    return path.relative(path.join(__dirname, '..', '..'), path.join(LOCALE_PATH, ...paths))
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
        const entry = path.join(dir, dirent.name)
        if (dirent.isDirectory()) {
            yield* walk(entry)
        } else if (dirent.isFile() && /\.(tsx?)$/.test(entry)) {
            yield entry
        }
    }
}
