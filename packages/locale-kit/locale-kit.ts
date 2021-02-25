/* eslint-disable no-restricted-imports */
import { difference, isEmpty, isNil, keys, omit, pick, toPairs, without } from 'lodash'
import { run } from '../../scripts/utils'
import {
    findAllUnusedKeys,
    findAllUsedKeys,
    getLocaleRelativePath,
    getMessagePath,
    LOCALE_NAMES,
    LOCALE_PATH,
    readMessages,
    writeMessages,
} from './utils'

async function findAllUnsyncedLocales(locales = without(LOCALE_NAMES, 'en')) {
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

async function removeAllUnusedKeys(keys: string[], locales = LOCALE_NAMES) {
    for (const name of locales) {
        const modifedMessages = omit(await readMessages(name), keys)
        await writeMessages(name, modifedMessages)
    }
}

async function setMissingKeys(locales = LOCALE_NAMES) {
    const keys = await findAllUsedKeys()
    for (const name of locales) {
        const modifedMessages = await readMessages(name)
        for (const key of keys) {
            if (isNil(modifedMessages[key])) {
                modifedMessages[key] = ''
            }
        }
        await writeMessages(name, modifedMessages)
    }
}

async function syncKeys(locales = without(LOCALE_NAMES, 'en')) {
    const baseMessages = await readMessages('en')
    const baseKeys = keys(baseMessages)
    for (const name of locales) {
        const nextMessages = await readMessages(name)
        for (const key of difference(baseKeys, keys(nextMessages))) {
            nextMessages[key] = ''
        }
        await writeMessages(name, pick(nextMessages, baseKeys))
    }
}

async function diagnosis() {
    const unusedKeys = await findAllUnusedKeys()
    if (unusedKeys.length) {
        for (const locale of LOCALE_NAMES) {
            const filePath = getLocaleRelativePath(getMessagePath(locale))
            console.log(
                `::warning file=${filePath}::Run \`npm run locale-kit -- --remove-unused-keys\` to solve this problem`,
            )
            const messages = keys(await readMessages(locale))
            for (const key of unusedKeys) {
                const index = messages.indexOf(key)
                if (index !== -1) {
                    console.log(`::warning file=${filePath},line=${index + 2}::Please remove the line`)
                }
            }
        }
    }
    const unsyncedLocales = await findAllUnsyncedLocales()
    if (!isEmpty(unsyncedLocales)) {
        for (const [locale, names] of toPairs(unsyncedLocales)) {
            const filePath = getLocaleRelativePath(getMessagePath(locale))
            console.log(`::warning file=${filePath}::Run \`npm run locale-kit -- --sync-keys\` to solve this problem`)
            for (const name of names) {
                console.log(`::warning file=${filePath}::The ${JSON.stringify(name)} is unsynced`)
            }
        }
    }
}

async function main() {
    const unusedKeys = await findAllUnusedKeys()
    console.error(
        'Scanned',
        unusedKeys.length,
        'unused keys, run `npm run locale-kit -- --remove-unused-keys` to remove them.',
    )
    console.error('Unsynced', keys(await findAllUnsyncedLocales()), 'locales')
    if (process.argv.includes('--remove-unused-keys')) {
        await removeAllUnusedKeys(unusedKeys)
        console.log('Unused keys removed')
    }
    if (process.argv.includes('--set-missing-keys')) {
        await setMissingKeys()
        console.log('Set missing keys')
    }
    if (process.argv.includes('--sync-keys')) {
        await syncKeys()
        console.log('Synced keys')
    }
}

if (process.env.CI) {
    diagnosis()
} else {
    main().then(() => {
        run(LOCALE_PATH, 'git', 'add', '.')
    })
}
