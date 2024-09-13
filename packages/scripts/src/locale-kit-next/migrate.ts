import type {
    __String,
    ArrowFunction,
    Block,
    CallExpression,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    ImportDeclaration,
    JsxElement,
    JsxExpression,
    LanguageService,
    NamedImports,
    Node,
    Program,
    ReferenceEntry,
    server,
    SourceFile,
    TypeChecker,
    TypeLiteralNode,
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

    const cwd = new URL('../../../plugins/Approval/', import.meta.url)
    const inputURL = new URL('./src/locales/i18n_generated.ts', cwd)
    const json = JSON.parse(await readFile(new URL('./en-US.json', inputURL), 'utf-8'))
    processFile(inputURL, json)

    await awaitChildProcess(shell.cwd(cwd)`npx lingui extract`)

    const reverseMap = new Map(Object.entries(json).map((v) => v.reverse() as any))

    await Promise.all(
        ['ja-JP', 'ko-KR', 'zh-CN', 'zh-TW'].map(async (lang) => {
            const langFile = JSON.parse(await readFile(new URL('./' + lang + '.json', inputURL), 'utf-8'))

            const poFilePath = new URL('../locale/' + lang + '.po', inputURL)
            const poFile = await readFile(poFilePath, 'utf-8')

            const nextPoFile: string[] = []
            let lastLine: string | undefined
            poFile.split('\n').forEach((line) => {
                found: if (line === 'msgstr ""' && lastLine) {
                    const key = reverseMap.get(lastLine) as string | undefined
                    if (!key || !langFile[key]) break found
                    nextPoFile.push('msgstr "' + langFile[key] + '"')
                    return
                }
                // msgid "xyz"
                if (line.startsWith('msgid')) lastLine = line.slice('msgid "'.length, -1)
                else lastLine = undefined
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
        if (!translateMethod.name || ts.isComputedPropertyName(translateMethod.name)) {
            console.warn(`${hookName} has invalid member at ${formatPos(i18nFile.file, translateMethod)}`)
            continue
        }
        const translateKey = translateMethod.name.text
        const enTranslate = String(targetJSON[translateKey] || '')

        if (!targetJSON[translateKey]) {
            console.warn(`Skip ${translateKey} in ${path}`)
            continue
        }

        updateReferences(
            () => i18nFile.service.getReferencesAtPosition(path, translateMethod.name!.getStart(i18nFile.file)),
            (reference, currentFile) => {
                // xyz in t.xyz()
                const referencingField = getNodeAtPosition(currentFile.file, reference.textSpan.start)
                // t.xyz()
                const translationCall = ts.findAncestor(referencingField, ts.isCallExpression)!
                const replacement = getTranslationMode(currentFile.file, currentFile.program, translationCall)
                if (!replacement) {
                    console.warn(`No migration found for ${formatPos(currentFile.file, translationCall)}`)
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
                        `<${TransName}>${enTranslate}</${TransName}>`,
                    )
                    if (transImportFrom !== false) addLinguiImport(currentFile, 'Trans', '@lingui/macro')
                } else {
                    const hookContainer = ts.findAncestor(replacement.node, findHookAncestor)
                    const has_ = currentFile.checker.resolveName('_', currentFile.file, ts.SymbolFlags.Value, true)
                    const msgImportFrom = getValueSymbolImportedFrom(
                        currentFile.program.getTypeChecker(),
                        replacement.node,
                        'msg',
                    )
                    currentFile.scriptInfo.editContent(
                        replacement.node.getStart(currentFile.file),
                        replacement.node.getEnd(),
                        '_(msg`' + enTranslate + '`)',
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
        ref.references.toReversed().forEach((reference) => {
            const node = getNodeAtPosition(file.file, reference.textSpan.start)
            const call = ts.findAncestor(node, ts.isCallExpression) // useHook()
            if (!call) {
                importStatement = ts.findAncestor(node, ts.isImportDeclaration)
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

            const refs = file.service.getReferencesAtPosition(file.file.fileName, t.getEnd())?.filter((ref) => {
                if (
                    ref.fileName === file.file.fileName &&
                    ref.contextSpan &&
                    ref.contextSpan.start === declList.getStart() &&
                    ref.contextSpan.length === declList.getWidth()
                )
                    return false
                return true
            })
            if (!refs?.length) {
                file.scriptInfo.editContent(varStatement.getFullStart(), varStatement.getEnd(), '')
                file.scriptInfo.saveTo(file.file.fileName)
            }
        })
        if (importStatement?.importClause) {
            if (
                !importStatement.importClause.name &&
                importStatement.importClause.namedBindings &&
                ts.isNamedImports(importStatement.importClause.namedBindings) &&
                importStatement.importClause.namedBindings.elements.length === 1
            ) {
                file.scriptInfo.editContent(importStatement.getFullStart(), importStatement.getEnd(), '')
                file.scriptInfo.saveTo(file.file.fileName)
            }
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
interface EditableSourceFile {
    readonly service: LanguageService
    readonly file: SourceFile
    readonly project: server.Project
    readonly program: Program
    readonly checker: TypeChecker
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
function getTranslationMode(file: SourceFile, program: Program, node: Node): undefined | TranslationMode {
    const call = ts.findAncestor(node, (node): node is CallExpression | JsxElement => {
        return node.kind === ts.SyntaxKind.CallExpression || node.kind === ts.SyntaxKind.JsxElement
    })
    if (!call) return undefined
    if (file.languageVariant === ts.LanguageVariant.Standard) return { context: 'Expression', node: call }
    const replaceNode = ts.isJsxExpression(call.parent) && !ts.isJsxAttribute(call.parent.parent) ? call.parent : call
    if (call.kind === ts.SyntaxKind.JsxElement) return { context: 'ReactNode', node: replaceNode }

    const checker = program.getTypeChecker()
    // for code <Text>{t.xyz()}</Text> it's yes
    // for code alert(t.xyz()) it's no
    const apparentType = checker.getContextualType(call)
    if (apparentType && !(apparentType.flags & ts.TypeFlags.Any)) {
        const reactNodeType = getReactNodeType(file, checker)
        if (reactNodeType && checker.isTypeAssignableTo(reactNodeType, apparentType)) {
            return { context: 'ReactNode', node: replaceNode }
        }
    }
    return { context: 'Expression', node: replaceNode }
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
    const last = node.body.statements.at(-1)
    return !!(last && ts.isReturnStatement(last) && last.expression?.kind === ts.SyntaxKind.JsxElement)
}

function isHookCall(node: Node): boolean {
    return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text.startsWith('use')
}
