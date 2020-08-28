import { promises as fs } from 'fs'
import _ from 'lodash'
import path from 'path'

const SOURCE_PATH = path.join(__dirname, '..', 'src')
const LOCALE_PATH = path.join(SOURCE_PATH, '_locales')
const EN_LOCALE_PATH = path.join(LOCALE_PATH, 'en', 'messages.json')

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

async function findAllUnusedKeys() {
    const usedKeys: string[] = []
    const keys = _.keys(JSON.parse(await fs.readFile(EN_LOCALE_PATH, 'utf-8')))
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
        const localePath = path.join(LOCALE_PATH, name, 'messages.json')
        const messages = JSON.parse(await fs.readFile(localePath, 'utf-8'))
        const modifedMessages = _.omit(messages, keys)
        await fs.writeFile(localePath, JSON.stringify(modifedMessages, null, 4), 'utf-8')
    }
}

async function syncKeyOrder() {
    const locales = ['zh', 'ja']
    const keys = _.keys(JSON.parse(await fs.readFile(EN_LOCALE_PATH, 'utf-8')))
    for (const name of locales) {
        const localePath = path.join(LOCALE_PATH, name, 'messages.json')
        let pairs = _.toPairs(JSON.parse(await fs.readFile(localePath, 'utf-8')))
        pairs = _.sortBy(pairs, ([key]) => keys.indexOf(key))
        const modifedMessages = _.fromPairs(pairs)
        await fs.writeFile(localePath, JSON.stringify(modifedMessages, null, 4), 'utf-8')
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
