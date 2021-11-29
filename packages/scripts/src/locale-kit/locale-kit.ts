/* eslint-disable no-restricted-imports */
import { keys, omit } from 'lodash-unified'
import {
    findAllUnusedKeys,
    getLocaleRelativePath,
    getMessagePath,
    LOCALE_NAMES,
    readMessages,
    writeMessages,
} from './utils'
import { parseArgs, task } from '../utils'

async function removeAllUnusedKeys(keys: string[], locales = LOCALE_NAMES) {
    for (const name of locales) {
        const modifiedMessages = omit(await readMessages(name), keys)
        await writeMessages(name, modifiedMessages)
    }
}

async function diagnosis() {
    const unusedKeys = await findAllUnusedKeys()
    if (unusedKeys.length) {
        const message = 'Run `npx gulp locale-kit --remove-unused-keys` to solve this problem'
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
}

export async function localeKit() {
    const argv = parseArgs<Args>()
    if (process.env.CI) return diagnosis()

    if (argv.removeUnusedKeys) {
        await removeAllUnusedKeys(await findAllUnusedKeys())
        console.log('Unused keys removed')
    }
    return
}

task(localeKit, 'locale-kit', 'Run locale kit.', {
    '--remove-unused-keys': 'to remove unused keys',
})
interface Args {
    removeUnusedKeys: boolean
    setMissingKeys: boolean
    syncKeys: boolean
}
