/// <reference lib="esnext" />

const path = require('path')
const ts: typeof import('ts-morph') = require('ts-morph')
import { SourceFile, Project } from 'ts-morph'

const project = new ts.Project({
    addFilesFromTsConfig: true,
    tsConfigFilePath: path.join(__dirname, '../tsconfig.json'),
})

// for (const each of project.getSourceFiles()) {
//     console.log(each.getFilePath())
// }

// Task 1: Ban imports from background page
const background = project.getSourceFileOrThrow(path.join(__dirname, '../src/background-service.ts'))

const diags = checkReferenceRecursive(
    project,
    background,
    x => {
        if (x.includes('@material-ui')) {
            return `@material-ui appears in the import chain!
To write a cross context file, write code like
    const { ListItem } = (
        GetContext() === 'background' ? {} : require('@material-ui/core')
    ) as typeof import('@material-ui/core')
    GetContext() === 'background' ? {} as any : require('@material-ui')
to import them conditionally.
`
        } else if (x === 'react') {
            return `React appears in the import chain!
You can write a page without import the React in the file.
React global variable has already in the UI context (like content script and options page)

To fix this problem, remove the import React from "react"

Notice: If any code in the background page use the "React" (by JSX or other way),
it will throw because there is no React global variable in the background page.
`
        }
        return null
    },
    new Set(),
    [background.getFilePath()],
)
if (diags) {
    throw 'There is diagnostics generated by the linter. Please fix them before continue.'
}

function checkReferenceRecursive(
    project: Project,
    file: SourceFile,
    getDiagnostics: (path: string) => string | null,
    checkedSourceFiles: Set<SourceFile>,
    referenceChain: readonly string[],
    hasDiagnostics: boolean = false,
): boolean {
    if (checkedSourceFiles.has(file)) return hasDiagnostics
    checkedSourceFiles.add(file)
    const ls = project.getLanguageService()
    for (const dependency of file.getImportDeclarations()) {
        let isTypeOnlyImport = true

        // We consider default import and ns import is not type only import
        if (dependency.getDefaultImport() || dependency.getNamespaceImport()) {
            isTypeOnlyImport = false
        } else {
            for (const x of dependency.getNamedImports()) {
                const symbol = x.getSymbol()
                if (!symbol) continue
                // We get value declarations here.
                // notice, some value has type scope decl and value scope decl at the same time
                // like class and namespace. we consider this as a value type import
                // because typescript will not remove it.

                outer: for (const decls of symbol.getDeclarations()) {
                    for (const refNodes of ls.findReferencesAsNodes(decls).filter(ts.TypeGuards.isIdentifier)) {
                        for (const def of refNodes.getDefinitions()) {
                            const kind = def.getKind()
                            // ScriptElementKind
                            if (['interface', 'type', 'primitiveType'].includes(kind) === false) {
                                isTypeOnlyImport = false
                                break outer
                            }
                        }
                    }
                }
            }
        }

        if (isTypeOnlyImport) {
            continue
        }

        const path = dependency.getModuleSpecifierValue()
        const nextRefChain: string[] = ([] as string[]).concat(referenceChain, [
            path.startsWith('.') ? dependency.getModuleSpecifierSourceFile()?.getFilePath() || path : path,
        ])
        const diag = getDiagnostics(path)
        if (diag) {
            console.error(`${diag}
Import chain:
${nextRefChain.map(x => '  => ' + x).join('\n')}
`)
            hasDiagnostics = true
        }
        if (path.startsWith('.')) {
            const sf = dependency.getModuleSpecifierSourceFile()
            if (sf) {
                hasDiagnostics =
                    checkReferenceRecursive(
                        project,
                        sf,
                        getDiagnostics,
                        checkedSourceFiles,
                        nextRefChain,
                        hasDiagnostics,
                    ) || hasDiagnostics
            }
        }
    }
    return hasDiagnostics
}
