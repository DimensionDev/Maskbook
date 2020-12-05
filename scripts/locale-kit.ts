import { promises as fs, readdirSync } from 'fs'
import _ from 'lodash'
import path from 'path'
import ts from 'typescript'
import { run } from './utils'

const SOURCE_PATH = path.join(__dirname, '../packages/maskbook/src')
const LOCALE_PATH = path.join(SOURCE_PATH, '_locales')

const _locales = readdirSync(LOCALE_PATH)

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
    await fs.writeFile(target, JSON.stringify(messages, null, 4) + '\n', 'utf-8')
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
    const transformer = (context: ts.TransformationContext) => (rootNode: ts.Node) => {
        const setFromVariableWrapper = (variableValue: string): ((node: ts.Node) => ts.Node) => {
            const setFromVariable = (node: ts.Node): ts.Node => {
                if (
                    ts.isVariableDeclaration(node) &&
                    ts.isVariableDeclarationList(node.parent) &&
                    !(node.parent.flags ^ ts.NodeFlags.Const) &&
                    ts.isIdentifier(node.name) &&
                    node.name.text === variableValue &&
                    node.initializer &&
                    ts.isStringLiteralLike(node.initializer)
                ) {
                    keys.add(node.initializer.text)
                }
                return ts.visitEachChild(node, setFromVariable, context)
            }
            return setFromVariable
        }
        const addKey = (node: ts.Node) => {
            if (ts.isStringLiteralLike(node)) {
                keys.add(node.text)
            } else if (ts.isIdentifier(node)) {
                setFromVariableWrapper(node.text)(rootNode)
            } else if (ts.isJsxExpression(node) && node.expression) {
                setFromVariableWrapper(node.expression.getText())(rootNode)
            }
        }
        const checkCallExpression = (node: ts.LeftHandSideExpression | undefined): boolean => {
            if (node === undefined) {
                return false
            } else if (ts.isIdentifier(node)) {
                return node.text === 't'
            } else if (ts.isPropertyAccessExpression(node)) {
                return node.name.text === 't'
            }
            return false
        }
        const visit: ts.Visitor = (node) => {
            if (ts.isIdentifier(node) && node.text === 't') {
                const expression = closest(node, ts.isCallExpression)
                if (!checkCallExpression(expression?.expression)) {
                    return node
                }
                const localeKey = expression?.arguments[0]
                if (localeKey === undefined) {
                    return node
                } else if (ts.isConditionalExpression(localeKey)) {
                    addKey(localeKey.whenTrue)
                    addKey(localeKey.whenFalse)
                } else {
                    addKey(localeKey)
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

async function findAllUsedKeys() {
    const usedKeys: string[] = []
    for await (const file of walk(SOURCE_PATH)) {
        usedKeys.push(...getUsedKeys(await fs.readFile(file, 'utf-8')))
    }
    return _.uniq(usedKeys)
}

async function findAllUnusedKeys() {
    return _.difference(_.keys(await readMessages('en')), await findAllUsedKeys())
}

async function findAllUnsyncedLocales(locales = _.without(_locales, 'en')) {
    const keys = _.keys(await readMessages('en'))
    const record: Record<string, string[]> = {}
    for (const name of locales) {
        const nextKeys = _.keys(await readMessages(name))
        const diffKeys = _.difference(keys, nextKeys)
        if (diffKeys.length) {
            record[name] = diffKeys
        }
    }
    return record
}

async function removeAllUnusedKeys(keys: string[], locales = _locales) {
    for (const name of locales) {
        const modifedMessages = _.omit(await readMessages(name), keys)
        await writeMessages(name, modifedMessages)
    }
}

async function setMissingKeys(locales = _locales) {
    const keys = await findAllUsedKeys()
    for (const name of locales) {
        const modifedMessages = await readMessages(name)
        for (const key of keys) {
            if (_.isNil(modifedMessages[key])) {
                modifedMessages[key] = ''
            }
        }
        await writeMessages(name, modifedMessages)
    }
}

async function syncKey(locales = _.without(_locales, 'en')) {
    const baseMessages = await readMessages('en')
    const baseKeys = _.keys(baseMessages)
    for (const name of locales) {
        const nextMessages = await readMessages(name)
        for (const key of _.difference(baseKeys, _.keys(nextMessages))) {
            nextMessages[key] = ''
        }
        await writeMessages(name, _.pick(nextMessages, baseKeys))
    }
}

async function diagnosis() {
    const unusedKeys = await findAllUnusedKeys()
    if (unusedKeys.length) {
        for (const locale of _locales) {
            const filePath = `packages/maskbook/src/_locales/${locale}/messages.json`
            console.log(
                `::warning file=${filePath}::Run \`npm run locale-kit -- --remove-unused-keys\` to solve this problem`,
            )
            const messages = _.keys(await readMessages(locale))
            for (const key of unusedKeys) {
                const index = messages.indexOf(key)
                if (index !== -1) {
                    console.log(`::warning file=${filePath},line=${index + 2}::Please remove the line`)
                }
            }
        }
    }
    const unsyncedLocales = await findAllUnsyncedLocales()
    if (!_.isEmpty(unsyncedLocales)) {
        for (const [locale, names] of _.toPairs(unsyncedLocales)) {
            const filePath = `packages/maskbook/src/_locales/${locale}/messages.json`
            console.log(`::warning file=${filePath}::Run \`npm run locale-kit -- --sync-key\` to solve this problem`)
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
    console.error('Unsynced', _.keys(await findAllUnsyncedLocales()), 'locales')
    if (process.argv.includes('--remove-unused-keys')) {
        await removeAllUnusedKeys(unusedKeys)
        console.log('Unused keys removed')
    }
    if (process.argv.includes('--set-missing-keys')) {
        await setMissingKeys()
        console.log('Set missing keys')
    }
    if (process.argv.includes('--sync-key')) {
        await syncKey()
        console.log('Synced keys')
    }
}

if (process.env.CI) {
    diagnosis()
} else {
    main().then(() => {
        run(undefined, 'git', 'add', 'packages/maskbook/src/_locales')
    })
}
