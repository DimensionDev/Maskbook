import { promises as fs } from 'fs'
import _ from 'lodash'
import path from 'path'

const SOURCE_PATH = path.join(__dirname, '..', 'src')
const LOCALE_PATH = path.join(SOURCE_PATH, '_locales')

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

async function readMessages(name: string) {
    const target = path.join(LOCALE_PATH, name, 'messages.json')
    return JSON.parse(await fs.readFile(target, 'utf-8'))
}

async function writeMessages(name: string, messages: unknown) {
    const target = path.join(LOCALE_PATH, name, 'messages.json')
    await fs.writeFile(target, JSON.stringify(messages, null, 4), 'utf-8')
}

async function findAllUnusedKeys() {
    const usedKeys: string[] = []
    const keys = _.keys(await readMessages('en'))
    for await (const file of walk(SOURCE_PATH)) {
        const content = await fs.readFile(file, 'utf-8')
        const filteredKeys = keys.filter(
            (key) => content.includes(`t('${key}'`) || content.includes(`i18nKey="${key}"`),
        )
        usedKeys.push(...filteredKeys)
    }
    return _.difference(keys, usedKeys)
}

async function removeAllUnusedKeys(keys: string[]) {
    const locales = ['en', 'zh', 'ja']
    for (const name of locales) {
        const modifedMessages = _.omit(await readMessages(name), keys)
        await writeMessages(name, modifedMessages)
    }
}

async function syncKeyOrder() {
    const locales = ['zh', 'ja']
    const keys = _.keys(await readMessages('en'))
    for (const name of locales) {
        const modifedMessages = _.chain(await readMessages(name))
            .toPairs()
            .sortBy(([key]) => keys.indexOf(key))
            .fromPairs()
            .value()
        await writeMessages(name, modifedMessages)
    }
}

async function main() {
    const unusedKeys = await findAllUnusedKeys()
    console.log('Scanned', unusedKeys.length, 'unused keys')
    if (process.argv.includes('--remove-unused-keys')) {
        await removeAllUnusedKeys(unusedKeys)
        console.log('Unused keys removed')
    }
    if (process.argv.includes('--sync-key-order')) {
        await syncKeyOrder()
        console.log('Synced key orders')
    }
}

main()
