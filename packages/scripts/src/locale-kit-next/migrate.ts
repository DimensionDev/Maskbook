import type {
    __String,
    AccessorDeclaration,
    ArrowFunction,
    Block,
    CallExpression,
    Expression,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    ImportDeclaration,
    JsxElement,
    JsxExpression,
    LanguageService,
    MethodDeclaration,
    NamedImports,
    Node,
    NoSubstitutionTemplateLiteral,
    NumericLiteral,
    Program,
    ReferencedSymbol,
    ReferenceEntry,
    server,
    SourceFile,
    SpreadAssignment,
    StringLiteral,
    TypeChecker,
    TypeLiteralNode,
    VariableDeclaration,
} from 'typescript'
import { ROOT_PATH } from '../utils/paths.js'
import { task } from '../utils/task.js'
import { fileURLToPath } from 'url'
import { readFile, writeFile } from 'fs/promises'
import { shell } from '../utils/run.js'
import { awaitChildProcess } from '../utils/awaitChildProcess.js'

let ts!: typeof import('typescript')
let projectService!: server.ProjectService
export async function migrate() {
    ts = await import('typescript')
    projectService = new ts.server.ProjectService({
        cancellationToken: ts.server.nullCancellationToken,
        host: {
            setImmediate,
            clearImmediate,
            ...(ts.sys as Required<typeof ts.sys>),
        },
        logger: {
            hasLevel: () => false,
            info: () => {},
            startGroup: console.group,
            endGroup: console.groupEnd,
            loggingEnabled: () => false,
        } as any,
        session: undefined,
        useInferredProjectPerProjectRoot: false,
        useSingleInferredProject: false,
        canUseWatchEvents: true,
        jsDocParsingMode: ts.JSDocParsingMode.ParseNone,
        serverMode: ts.LanguageServiceMode.Semantic,
        suppressDiagnosticEvents: true,
    })

    const cwd = new URL('../../../shared-base-ui/', import.meta.url)
    const inputURL = new URL('./src/locales/i18n_generated.ts', cwd)
    const enUS_URL = new URL('./src/locales/en-US.json', cwd)
    const json = JSON.parse(await readFile(enUS_URL, 'utf-8'))
    processFile(inputURL, json)

    await awaitChildProcess(shell.cwd(cwd)`npx lingui extract`)

    await Promise.all(
        ['ja-JP', 'ko-KR', 'zh-CN', 'zh-TW'].map(async (lang) => {
            const langFile = JSON.parse(await readFile(new URL('./' + lang + '.json', enUS_URL), 'utf-8'))

            const poFilePath = new URL('./src/locale/' + lang + '.po', cwd)
            const poFile = await readFile(poFilePath, 'utf-8')

            const nextPoFile: string[] = []
            let poString: string | undefined
            poFile.split('\n').forEach((line) => {
                if (line === 'msgstr ""' && poString) {
                    const translate = mapTranslate(poString, json, langFile)
                    if (translate) nextPoFile.push('msgstr "' + translate + '"')
                    else nextPoFile.push(line)
                    return
                }
                // msgid "xyz"
                if (line.startsWith('msgid')) poString = line.slice('msgid "'.length, -1)
                else poString = undefined
                nextPoFile.push(line)
            })
            await writeFile(poFilePath, nextPoFile.join('\n'))
        }),
    )
    await awaitChildProcess(shell.cwd(cwd)`npx lingui compile`)
    await awaitChildProcess(shell.cwd(cwd)`npx prettier --write .`)
    // lingui includes position of the string
    await awaitChildProcess(shell.cwd(cwd)`npx lingui extract`)

    setTimeout(() => process.exit(0), 100)
}

task(migrate, 'migrate-lingui', 'Migrate the locale files.')

function processFile(url: URL, targetJSON: any) {
    const path = ts.server.toNormalizedPath(fileURLToPath(url))
    projectService.openClientFile(path)
    const i18nFile = getSourceFile(path)
    if (!i18nFile) return console.warn(`${path} not found.`)

    const useTrans = i18nFile.file.statements.find((node): node is FunctionDeclaration & { type: TypeLiteralNode } => {
        return !!(
            ts.isFunctionDeclaration(node) &&
            node.name?.text.startsWith('use') &&
            node.type &&
            ts.isTypeLiteralNode(node.type)
        )
    })
    if (!useTrans) return console.warn(`No valid hook found in ${path}.`)
    const hookName = useTrans.name!.text
    // migrate t.trans() call
    for (const translateMethod of useTrans.type.members) {
        let name: Identifier | StringLiteral | NoSubstitutionTemplateLiteral | NumericLiteral
        if (translateMethod.name) {
            if (ts.isComputedPropertyName(translateMethod.name)) {
                if (ts.isStringLiteral(translateMethod.name.expression)) name = translateMethod.name.expression
            } else if (!ts.isPrivateIdentifier(translateMethod.name)) name = translateMethod.name
        }
        if (!name!) {
            console.warn(`${hookName} has invalid member at ${formatPos(i18nFile.file, translateMethod)}`)
            continue
        }
        const translateKey = name.text
        const enTranslate = String(targetJSON[translateKey] || '')
        const parsedEnTranslate = parseI18String(enTranslate, 'i18next')

        // complex case, manually handle it
        if (!parsedEnTranslate || !enTranslate) continue

        updateReferences(
            () => i18nFile.service.getReferencesAtPosition(path, name.getEnd()),
            (reference, currentFile) => {
                // xyz in t.xyz()
                const referencingField = getNodeAtPosition(currentFile.file, reference.textSpan.start)
                // t.xyz()
                const translationCall = ts.findAncestor(referencingField, ts.isCallExpression)!
                const replacement = getTranslationMode(currentFile, translationCall)
                if (!replacement) {
                    console.warn(`No migration found for ${formatPos(currentFile.file, translationCall)}`)
                    return false
                }
                const interpolatedString = interpolateParts(
                    replacement.context,
                    parsedEnTranslate,
                    translationCall.arguments,
                )
                if (!interpolatedString) {
                    console.warn(
                        `No interpolate parts migration found for string at ${formatPos(currentFile.file, translationCall)}`,
                    )
                    return false
                }
                if (replacement.context === 'ReactNode') {
                    const transImportFrom = getValueSymbolImportedFrom(
                        currentFile.program.getTypeChecker(),
                        translationCall,
                        'Trans',
                    )
                    const TransName =
                        transImportFrom === undefined || transImportFrom === '@lingui/macro' ? 'Trans' : 'LinguiTrans'
                    currentFile.scriptInfo.editContent(
                        replacement.node.getStart(currentFile.file),
                        replacement.node.getEnd(),
                        `<${TransName}>${interpolatedString}</${TransName}>`,
                    )
                    if (transImportFrom !== false) addLinguiImport(currentFile, 'Trans', '@lingui/macro')
                } else {
                    const hookContainer = ts.findAncestor(replacement.node, findHookAncestor)
                    const has_ = currentFile.checker.resolveName('_', replacement.node, ts.SymbolFlags.Value, true)
                    const msgImportFrom = getValueSymbolImportedFrom(
                        currentFile.program.getTypeChecker(),
                        replacement.node,
                        'msg',
                    )
                    currentFile.scriptInfo.editContent(
                        replacement.node.getStart(currentFile.file),
                        replacement.node.getEnd(),
                        '_(msg`' + interpolatedString + '`)',
                    )
                    if (!has_ && hookContainer) {
                        const first = hookContainer.body.statements[0]
                        const blankLength = Math.abs(first.getFullStart() - first.getStart(currentFile.file))
                        const blankText = '\n' + ' '.repeat(blankLength - 1)
                        currentFile.scriptInfo.editContent(
                            first.getFullStart(),
                            first.getFullStart(),
                            blankText + `const { _ } = useLingui()`,
                        )
                    }
                    if (msgImportFrom !== false) addLinguiImport(currentFile, 'msg', '@lingui/macro')
                    addLinguiImport(currentFile, 'useLingui', '@lingui/react')
                }
                return true
            },
            [path],
        )
    }

    // remove const { t } = useSomeTrans() call if they're unused
    i18nFile.service.findReferences(i18nFile.file.fileName, useTrans.name!.getEnd())?.forEach((ref) => {
        if (ref.definition.fileName === i18nFile.file.fileName) return
        const file = getSourceFile(ref.references[0].fileName)
        if (!file) return
        let importStatement: ImportDeclaration | undefined
        let importedName: Identifier | undefined
        ref.references.toReversed().forEach((reference) => {
            const node = getNodeAtPosition(file.file, reference.textSpan.start)
            const call = ts.findAncestor(node, ts.isCallExpression) // useHook()
            if (!call) {
                importStatement = ts.findAncestor(node, ts.isImportDeclaration)
                importedName = ts.isIdentifier(node) ? node : undefined
                return
            }
            if (call.expression.kind !== ts.SyntaxKind.Identifier) return
            if (call.arguments.length) return

            const decl = call.parent
            if (!ts.isVariableDeclaration(decl)) return

            const declList = call.parent.parent
            if (!ts.isVariableDeclarationList(declList) || declList.declarations.length > 1) return

            const varStatement = declList.parent
            if (!ts.isVariableStatement(varStatement)) return

            const t = decl.name
            if (!ts.isIdentifier(t)) return

            const refs = excludeSelfReference(file.service.findReferences(file.file.fileName, t.getEnd()))?.flatMap(
                (x) => x.references,
            )
            if (!refs?.length) {
                file.scriptInfo.editContent(varStatement.getFullStart(), varStatement.getEnd(), '')
                file.scriptInfo.saveTo(file.file.fileName)
            }
        })

        if (importedName && importStatement?.importClause) {
            const importRefs = excludeSelfReference(
                file.service
                    .findReferences(file.file.fileName, importedName.end)
                    ?.filter((x) => x.definition.fileName === file.file.fileName),
            )?.flatMap((x) => x.references)
            if (
                !importRefs?.length &&
                !importStatement.importClause.name &&
                importStatement.importClause.namedBindings &&
                ts.isNamedImports(importStatement.importClause.namedBindings)
            ) {
                if (importStatement.importClause.namedBindings.elements.length === 1) {
                    file.scriptInfo.editContent(importStatement.getFullStart(), importStatement.getEnd(), '')
                } else if (importedName) {
                    file.scriptInfo.editContent(importedName.getFullStart(), importedName.getEnd(), '')
                }
                file.scriptInfo.saveTo(file.file.fileName)
            }
        }
    })
}
function excludeSelfReference(symbols: ReferencedSymbol[] | undefined) {
    return symbols?.map((symbol) => {
        const { definition, references } = symbol
        return {
            definition,
            references: references.filter(
                (x) =>
                    !(
                        x.fileName === definition.fileName &&
                        x.textSpan.start === definition.textSpan.start &&
                        x.textSpan.length === definition.textSpan.length
                    ),
            ),
        }
    })
}
function updateReferences(
    getReferences: () => ReferenceEntry[] | undefined,
    updateCallback: (reference: ReferenceEntry, referencingFile: EditableSourceFile) => boolean,
    excludedFiles: string[],
) {
    let references = getReferences()
    while (references?.length) {
        let hasTextEdit = false
        const visitedFile = new Set(excludedFiles)

        for (const reference of references) {
            if (visitedFile.has(reference.fileName)) continue
            projectService.openClientFile(reference.fileName)

            const ref = getSourceFile(reference.fileName)
            if (!ref) {
                console.warn(`Editor of ${reference.fileName} not found.`)
                continue
            }

            const update = updateCallback(reference, ref)
            if (update) {
                ref.scriptInfo.saveTo(ref.file.fileName)
                visitedFile.add(ref.file.fileName)
                hasTextEdit = true
            }
        }
        if (!hasTextEdit) break
        references = getReferences()
    }
}
function addLinguiImport(ref: EditableSourceFile, symbolName: string, from: string) {
    if (getValueSymbolImportedFrom(ref.checker, ref.file, symbolName) === from) return

    const hasOtherTrans = ref.checker.resolveName(symbolName, ref.file, ts.SymbolFlags.Value, true)
    const LinguiImportDeclaration = ref.file.statements.find(
        (node) =>
            ts.isImportDeclaration(node) &&
            (node.moduleSpecifier as Identifier).text === from &&
            node.importClause?.namedBindings &&
            ts.isNamedImports(node.importClause.namedBindings),
    ) as ImportDeclaration

    if (LinguiImportDeclaration) {
        const importClause = LinguiImportDeclaration.importClause!.namedBindings!
        const newImport = printNode(
            ref.file,
            ts.factory.createNamedImports([
                ...(LinguiImportDeclaration.importClause!.namedBindings as NamedImports).elements,
                ts.factory.createImportSpecifier(
                    false,
                    hasOtherTrans ? ts.factory.createIdentifier('Lingui_' + symbolName) : undefined,
                    ts.factory.createIdentifier(symbolName),
                ),
            ]),
        )
        ref.scriptInfo.editContent(importClause.getStart(ref.file), importClause.getEnd(), newImport)
    } else {
        const lastImport = ref.file.statements.toReversed().find(ts.isImportDeclaration)
        const pos = lastImport ? lastImport.getEnd() + 1 : 0
        ref.scriptInfo.editContent(
            pos,
            pos,
            `import { ${hasOtherTrans ? symbolName + ' as Lingui_' + symbolName : symbolName} } from '${from}'\n`,
        )
    }
    if (!hasOtherTrans) return

    const otherTransDeclaration = ref.checker.resolveName(symbolName, ref.file, ts.SymbolFlags.Value, true)
        ?.declarations?.[0]
    if (!otherTransDeclaration) return console.warn(`Cannot rename old symbol at ${formatPos(ref.file, ref.file)}`)
    rename(ref.service, ref.scriptInfo, otherTransDeclaration.getEnd(), symbolName + '2')
    rename(ref.service, ref.scriptInfo, ref.file.getFullText(ref.file).indexOf('Lingui_' + symbolName), symbolName)
}
// undefined: no symbol, false: symbol is a local symbol
function getValueSymbolImportedFrom(
    checker: TypeChecker,
    position: Node,
    symbolName: string,
): undefined | string | false {
    const TransSymbol = checker.resolveName(symbolName, position, ts.SymbolFlags.Value, true)
    const TransDeclaration = TransSymbol?.declarations?.[0]
    if (!TransDeclaration) return undefined
    const import_ = ts.findAncestor(TransDeclaration, ts.isImportDeclaration)
    if (!import_) {
        console.warn(
            `Cannot add auto-import for ${formatPos(position.getSourceFile(), position)} because there is a local symbol.`,
        )
        return false
    }
    return (import_.moduleSpecifier as Identifier)?.text
}
function rename(service: LanguageService, scriptInfo: server.ScriptInfo, position: number, newName: string) {
    const locations = service.findRenameLocations(scriptInfo.fileName, position, false, false, {
        providePrefixAndSuffixTextForRename: true,
    })
    for (const location of locations
        ?.filter((x) => x.fileName === scriptInfo.fileName)
        .sort((a, b) => b.textSpan.start - a.textSpan.start) || []) {
        scriptInfo.editContent(
            location.textSpan.start,
            location.textSpan.start + location.textSpan.length,
            (location.prefixText || '') + newName + (location.suffixText || ''),
        )
    }
}
interface ReadonlySourceFile {
    readonly service: LanguageService
    readonly file: SourceFile
    readonly project: server.Project
    readonly program: Program
    readonly checker: TypeChecker
}
interface EditableSourceFile extends ReadonlySourceFile {
    readonly scriptInfo: server.ScriptInfo
}
function getSourceFile(path: string): EditableSourceFile | undefined {
    const project = projectService.getDefaultProjectForFile(ts.server.toNormalizedPath(path), true)
    if (!project) return void console.warn('No project found for', path)
    const languageService = project.getLanguageService(true)
    return {
        service: languageService,
        project,
        get file() {
            return languageService.getProgram()!.getSourceFile(path)!
        },
        get program() {
            return languageService.getProgram()!
        },
        get checker() {
            return languageService.getProgram()!.getTypeChecker()
        },
        get scriptInfo() {
            return project.getScriptInfo(path)!
        },
    }
}
function printNode(file: SourceFile, node: Node) {
    return ts.createPrinter().printNode(ts.EmitHint.Unspecified, node, file)
}
function getNodeAtPosition(sourceFile: SourceFile, position: number): Node {
    let current: Node = sourceFile
    const getContainingChild = (child: Node) => {
        if (
            child.pos <= position &&
            (position < child.end || (position === child.end && child.kind === ts.SyntaxKind.EndOfFileToken))
        )
            return child
        return undefined
    }
    while (true) {
        const child = ts.forEachChild(current, getContainingChild)
        if (!child) return current
        current = child
    }
}
function formatPos(file: SourceFile, node: Node) {
    const pathLength = fileURLToPath(ROOT_PATH).length
    if (!node) return file.fileName.slice(pathLength)
    const { line, character } = file.getLineAndCharacterOfPosition(node.getStart(file))
    return `${file.fileName.slice(pathLength)}:${line + 1}:${character + 1}`
}
interface TranslationMode {
    context: 'ReactNode' | 'Expression'
    node: CallExpression | JsxExpression | JsxElement
}
function getTranslationMode({ checker, file, service }: ReadonlySourceFile, node: Node): undefined | TranslationMode {
    const call = ts.findAncestor(node, (node): node is CallExpression | JsxElement => {
        return node.kind === ts.SyntaxKind.CallExpression || node.kind === ts.SyntaxKind.JsxElement
    })
    if (!call) return undefined
    if (file.languageVariant === ts.LanguageVariant.Standard) return { context: 'Expression', node: call }
    const replaceNode = ts.isJsxExpression(call.parent) && !ts.isJsxAttribute(call.parent.parent) ? call.parent : call
    if (call.kind === ts.SyntaxKind.JsxElement) return { context: 'ReactNode', node: replaceNode }

    // for some simple cases like
    // const str = cond ? t.call() : t.call2()
    // try to detect its usage
    const assignedVariable = ts.findAncestor(call.parent, (node) => {
        switch (node.kind) {
            case ts.SyntaxKind.ConditionalExpression:
                return false
            case ts.SyntaxKind.IfStatement:
                return node.parent.kind === ts.SyntaxKind.Block
            case ts.SyntaxKind.Block:
                return (
                    node.parent.kind === ts.SyntaxKind.ArrowFunction ||
                    node.parent.kind === ts.SyntaxKind.FunctionExpression ||
                    node.parent.kind === ts.SyntaxKind.IfStatement
                )
            // if (expr) return t.call()
            case ts.SyntaxKind.ReturnStatement:
                return false
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.ArrowFunction:
                // const expr = useMemo(() => { ... })
                const fnLike = node as FunctionDeclaration | FunctionExpression | ArrowFunction
                if (!ts.isCallExpression(fnLike.parent)) return 'quit'
                const call = fnLike.parent as CallExpression
                if (
                    call.arguments[0] === node &&
                    ts.isIdentifier(call.expression) &&
                    call.expression.text === 'useMemo'
                )
                    return false
                return 'quit'
            case ts.SyntaxKind.VariableDeclaration:
                const decl = node as VariableDeclaration
                return ts.isIdentifier(decl.name)
            default:
                return 'quit'
        }
    })

    if (assignedVariable) {
        const references = service.getReferencesAtPosition(file.fileName, assignedVariable.end)
        const isAllUseSiteAcceptsReactNode =
            references?.every(({ fileName, textSpan }) => {
                const file = getSourceFile(fileName)
                if (!file) return false
                const node = getNodeAtPosition(file.file, textSpan.start)
                if (!ts.isExpression(node)) return false
                return isReactNodeAssignableToContextualType(file.checker, file.file, node)
            }) || true
        if (isAllUseSiteAcceptsReactNode) {
            return { context: 'ReactNode', node: replaceNode }
        }
    } else if (isReactNodeAssignableToContextualType(checker, file, call)) {
        return { context: 'ReactNode', node: replaceNode }
    }
    return { context: 'Expression', node: replaceNode }
}
// for code <Text>{t.xyz()}</Text> it's yes
// for code alert(t.xyz()) it's no
function isReactNodeAssignableToContextualType(checker: TypeChecker, file: SourceFile, node: Expression) {
    const apparentType = checker.getContextualType(node)
    if (apparentType && !(apparentType.flags & ts.TypeFlags.Any)) {
        const reactNodeType = getReactNodeType(file, checker)
        if (reactNodeType && checker.isTypeAssignableTo(reactNodeType, apparentType)) {
            return true
        }
    }
    return false
}
function getReactNodeType(position: Node, checker: TypeChecker) {
    const namespace = checker.resolveName('React', position, ts.SymbolFlags.Namespace, false)
    if (!namespace) return
    const resolvedNamespace = checker.getTypeOfSymbol(namespace).getSymbol()
    if (!resolvedNamespace) return
    const reactNodeSymbol = resolvedNamespace.exports?.get('ReactNode' as __String)
    if (!reactNodeSymbol) return
    return checker.getDeclaredTypeOfSymbol(reactNodeSymbol)
}
function findHookAncestor(
    node: Node,
): node is (FunctionDeclaration | FunctionExpression | ArrowFunction) & { body: Block } {
    if (!(ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))) return false
    if (!node.body || !ts.isBlock(node.body)) return false
    if (
        node.body.statements.some((statement) => {
            if (ts.isVariableStatement(statement)) {
                const init = statement.declarationList.declarations[0].initializer
                return init && isHookCall(init)
            } else if (ts.isExpressionStatement(statement)) {
                return isHookCall(statement.expression)
            } else return false
        })
    )
        return true
    if (ts.isCallExpression(node.parent)) {
        if (ts.isIdentifier(node.parent.expression)) {
            return node.parent.expression.text === 'memo'
        }
        return false
    }
    const last = node.body.statements.at(-1)
    return !!(last && ts.isReturnStatement(last) && last.expression?.kind === ts.SyntaxKind.JsxElement)
}

function isHookCall(node: Node): boolean {
    return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text.startsWith('use')
}

interface Interpolation {
    name: string
}
type TranslatePart = string | Interpolation
const cache = new Map<string, undefined | readonly TranslatePart[]>()
function parseI18String(string: string, mode: 'po' | 'i18next'): readonly TranslatePart[] | undefined {
    if (cache.has(string)) return cache.get(string)
    if (string.includes('$t(')) {
        cache.set(string, undefined)
        return undefined
    }
    const parts: TranslatePart[] = []
    while (string) {
        let start = string.indexOf(mode === 'po' ? '{' : '{{')
        if (start === -1) {
            parts.push(string)
            break
        }
        parts.push(string.slice(0, start))

        if (mode === 'po') string = string.slice(start + 1)
        else {
            if (string.startsWith('{{-', start)) string = string.slice(start + 3)
            else string = string.slice(start + 2)
        }

        let interpolation: Interpolation = { name: '' }
        const simpleName = string.match(mode === 'po' ? /\s{0,}(\w)\s{0,}\}/ : /\s{0,}(\w+)\s{0,}\}\}/)
        if (simpleName) interpolation.name = simpleName[1]
        else {
            cache.set(string, undefined)
            return undefined
        }

        parts.push(interpolation)
        string = string.slice(simpleName[0].length)
    }
    cache.set(string, parts)
    return parts
}
const reverseMap = new Map<string, string>()
function mapTranslate(
    poString: string,
    enStrings: Record<string, string>,
    translatedStrings: Record<string, string>,
): string | undefined {
    const newParts = parseI18String(poString, 'po')
    if (!newParts) return undefined

    let translateKey: string
    if (reverseMap.has(poString)) translateKey = reverseMap.get(poString)!
    else
        out: for (const key in enStrings) {
            const oldParts = parseI18String(enStrings[key], 'i18next')
            if (!oldParts) continue
            if (newParts.length !== oldParts.length) continue
            for (const [index, newPart] of newParts.entries()) {
                const oldPart = oldParts[index]
                if (typeof newPart !== typeof oldPart) continue out
                else if (typeof newPart === 'string' && newPart !== oldParts[index]) continue out
                else if (typeof newPart === 'object' && typeof oldPart === 'object' && newPart.name !== newPart.name)
                    continue out
            }
            translateKey = key
            break
        }
    if (translateKey!) {
        reverseMap.set(poString, translateKey)
        if (!translatedStrings[translateKey]) return undefined
        const oldParts = parseI18String(enStrings[translateKey], 'i18next')!
        const translatedParts = parseI18String(translatedStrings[translateKey], 'i18next')!

        if (oldParts.length !== translatedParts.length) {
            console.warn(translateKey, 'has a bad translation.')
            return undefined
        }

        const oldVariables = oldParts.filter((x): x is Interpolation => typeof x !== 'string')
        const newVariables = newParts.filter((x): x is Interpolation => typeof x !== 'string')
        const variableMap = new Map<string, string>()
        let autoIncrement = 0
        for (const oldVariable of oldVariables) {
            const newIndex = newVariables.findIndex((x) => x.name === oldVariable.name)
            if (newIndex !== -1) variableMap.set(oldVariable.name, (newParts[newIndex] as Interpolation).name)
            else {
                variableMap.set(oldVariable.name, autoIncrement.toString())
                autoIncrement++
            }
        }

        return newParts
            .map((x, i) =>
                typeof x === 'string' ?
                    translatedParts[i]
                :   `{${variableMap.get((translatedParts[i] as Interpolation).name)}}`,
            )
            .join('')
    }
    return undefined
}
function interpolateParts(
    mode: 'ReactNode' | 'Expression',
    parts: readonly TranslatePart[],
    callParams: CallExpression['arguments'],
): string | undefined {
    if (parts.length === 1 && typeof parts[0] === 'string') return parts[0]
    if (!callParams[0]) return undefined
    const obj0 = callParams[0]
    if (!ts.isObjectLiteralExpression(obj0)) return undefined

    let string = ''
    for (const part of parts) {
        if (typeof part === 'string') {
            string += attachString(mode, part)
            continue
        }
        if (mode === 'Expression') string += '$'
        string += '{'

        const expr = obj0.properties.find(
            (x): x is Exclude<typeof x, SpreadAssignment | MethodDeclaration | AccessorDeclaration> => {
                if (ts.isSpreadAssignment(x) || ts.isMethodDeclaration(x) || ts.isAccessor(x)) return false
                if (ts.isComputedPropertyName(x.name) || ts.isPrivateIdentifier(x.name)) return false
                return x.name.text === part.name
            },
        )
        if (!expr) return undefined

        if (ts.isShorthandPropertyAssignment(expr)) {
            string += expr.name.text
        } else {
            string += printNode(obj0.getSourceFile(), expr.initializer)
        }

        string += '}'
    }
    return string
}
function attachString(mode: 'ReactNode' | 'Expression', string: string) {
    return string
}
