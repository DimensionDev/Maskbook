import { promises as fs } from 'fs'
import _ from 'lodash'
import path from 'path'
import ts from 'typescript'

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

function getUsedKeys(content: string) {
    const keys = new Set<string>()
    const closest = <T extends ts.Node>(node: ts.Node, match: (node: ts.Node) => node is T): T | undefined => {
        while (node) {
            if (match(node)) {
                return node
            }
            node = node.parent
        }
        return undefined
    }
    const addKey = (node: ts.Node) => {
        if (ts.isStringLiteralLike(node)) {
            keys.add(node.text)
        }
    }
    const transformer = (context: ts.TransformationContext) => (rootNode: ts.Node) => {
        const visit: ts.Visitor = (node) => {
            if (ts.isIdentifier(node) && node.text === 't') {
                const localeKey = closest(node, ts.isCallExpression)?.arguments[0]
                if (localeKey === undefined) {
                    return node
                } else if (ts.isStringLiteralLike(localeKey)) {
                    addKey(localeKey)
                } else if (ts.isConditionalExpression(localeKey)) {
                    addKey(localeKey.whenTrue)
                    addKey(localeKey.whenFalse)
                }
            } else if (ts.isJsxAttribute(node) && node.name.escapedText === 'i18nKey' && node.initializer) {
                addKey(node.initializer)
            }
            return ts.visitEachChild(node, visit, context)
        }
        return ts.visitNode(rootNode, visit)
    }
    ts.transform(ts.createSourceFile('', content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), [transformer])
    return keys
}

async function findAllUnusedKeys() {
    const usedKeys: string[] = []
    const keys = _.keys(await readMessages('en'))
    for await (const file of walk(SOURCE_PATH)) {
        usedKeys.push(...getUsedKeys(await fs.readFile(file, 'utf-8')))
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
        console.log('Synced keys order')
    }
    return unusedKeys
}

main().then((unusedKeys) => {
    if (!process.env.CI) {
        return
    }
    if (unusedKeys.length > 0) {
        console.log(unusedKeys)
        process.exit(1)
    }
})
