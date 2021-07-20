#!/usr/bin/env ts-node
/* eslint-disable no-restricted-imports */
import { difference, isEmpty, isNil, keys, omit, pick, toPairs, without } from 'lodash'
import {
    findAllUnusedKeys,
    findAllUsedKeys,
    getLocaleRelativePath,
    getMessagePath,
    LOCALE_NAMES,
    readMessages,
    writeMessages,
    findAllUnsyncedLocales,
} from './utils'

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
        const message = 'Run `npx locale-kit --remove-unused-keys` to solve this problem'
        for (const locale of LOCALE_NAMES) {
            const filePath = getLocaleRelativePath(getMessagePath(locale))
            console.log(`::warning file=${filePath}::${message}`)
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
        const message = 'Run `npx locale-kit --sync-keys` to solve this problem'
        for (const [locale, names] of toPairs(unsyncedLocales)) {
            const filePath = getLocaleRelativePath(getMessagePath(locale))
            console.log(`::warning file=${filePath}::${message}`)
            for (const name of names) {
                console.log(`::warning file=${filePath}::The ${JSON.stringify(name)} is unsynced`)
            }
        }
    }
}

async function main() {
    if (process.argv.includes('--remove-unused-keys')) {
        await removeAllUnusedKeys(await findAllUnusedKeys())
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
    main()
}
