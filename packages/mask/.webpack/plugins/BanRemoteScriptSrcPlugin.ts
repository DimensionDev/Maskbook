import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { SourceMapConsumer, type RawSourceMap } from 'source-map'

const PLUGIN_NAME = 'RemoteScriptSrcPlugin'
const REMOTE_SCRIPT_SRC =
    /\.src\s*=\s*(["'`])((?:\\.|(?!\1)[\s\S])*?https:\/\/(?:\\.|(?!\1)[\s\S])*?\.js(?:\\.|(?!\1)[\s\S])*?)\1\s*;?/g
const URL_IN_LITERAL = /https:\/\/[^"'`\s;]+?\.js(?:\?[^"'`\s;]*)?/g

type PackageMatch = {
    packageName: string
    resource: string
}

type ModuleMatch = PackageMatch & {
    module?: Module
}

type Violation = {
    assetName: string
    expression: string
    literal: string
    urls: string[]
    generated: SourcePosition
}

const packageNameCache = new Map<string, string | undefined>()

type Compilation = import('webpack').Compilation | import('@rspack/core').Compilation
type Module = import('webpack').Module | import('@rspack/core').Module
type SourcePosition = {
    line: number
    column: number
}
type SourceLocation = {
    source: string
    line: number
    column: number
    name?: string
}
export class BanRemoteScriptSrcPlugin {
    apply(compiler: import('webpack').Compiler | import('@rspack/core').Compiler) {
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            const report = () => this.reportViolations(compilation)
            if (compilation.hooks.processAssets) {
                compilation.hooks.processAssets.tapPromise(
                    {
                        name: PLUGIN_NAME,
                        stage: compiler.webpack?.Compilation?.PROCESS_ASSETS_STAGE_REPORT,
                    },
                    report,
                )
            } else {
                compilation.hooks.afterProcessAssets.tap(PLUGIN_NAME, report)
            }
        })
    }

    private async reportViolations(compilation: Compilation) {
        const violations = this.findViolations(compilation)
        if (!violations.length) return

        const moduleMatches = this.findModuleMatches(compilation, violations)
        const sourceLocations = await this.findSourceLocations(compilation, violations)
        for (const violation of violations) {
            const matches = moduleMatches.get(violation) ?? []
            const sourceLocation = sourceLocations.get(violation)
            const error = createWebpackError(
                compilation,
                [
                    'Build output contains remote script URL assignments.',
                    'Assignments like element.src = "https://...js" are not allowed in extension output.',
                    `Appears in asset: ${violation.assetName}:${violation.generated.line}:${violation.generated.column + 1}`,
                    `URL: ${violation.urls.join(', ') || violation.literal}`,
                ].join('\n'),
            )
            error.loc = toWebpackLocation(sourceLocation, violation)
            error.module = findErrorModule(compilation, matches, sourceLocation)
            compilation.errors.push(error)
        }
    }

    private findViolations(compilation: Compilation): Violation[] {
        const violations: Violation[] = []
        const assets =
            typeof compilation.getAssets === 'function' ? compilation.getAssets() : getLegacyAssets(compilation)
        for (const asset of assets) {
            if (!asset.name.endsWith('.js')) continue

            const source = asset.source?.source?.()
            const code = Buffer.isBuffer(source) ? source.toString('utf-8') : String(source ?? '')
            for (const match of code.matchAll(REMOTE_SCRIPT_SRC)) {
                const expression = match[0]
                const literal = match[2]
                const generated = offsetToPosition(code, match.index ?? 0)
                violations.push({
                    assetName: asset.name,
                    expression: trimForMessage(expression),
                    literal,
                    urls: literal
                        .matchAll(URL_IN_LITERAL)
                        .map((url) => url[0])
                        .toArray(),
                    generated,
                })
            }
        }
        return violations
    }

    private findModuleMatches(compilation: Compilation, violations: Violation[]) {
        const result = new Map<Violation, ModuleMatch[]>()
        for (const violation of violations) {
            const matches = new Map<string, ModuleMatch>()
            for (const module of compilation.modules ?? []) {
                const resource = getModuleResource(module)
                const moduleSource = getModuleSource(module)
                if (!resource || !moduleSource) continue

                if (!sourceContainsViolation(moduleSource, violation)) continue
                const packageName = packageNameFromResource(resource)
                if (packageName) matches.set(`${packageName}\0${resource}`, { packageName, resource, module })
            }

            const sourceFilename = (compilation as any).assetsInfo?.get?.(violation.assetName)?.sourceFilename
            if (typeof sourceFilename === 'string') {
                const packageName = packageNameFromResource(sourceFilename)
                if (packageName)
                    matches.set(`${packageName}\0${sourceFilename}`, {
                        packageName,
                        resource: sourceFilename,
                    })
            }

            result.set(violation, matches.values().toArray())
        }
        return result
    }

    private async findSourceLocations(compilation: Compilation, violations: Violation[]) {
        const result = new Map<Violation, SourceLocation | undefined>()
        const sourceMapCache = new Map<string, RawSourceMap | undefined>()
        for (const violation of violations) {
            let sourceMap = sourceMapCache.get(violation.assetName)
            if (!sourceMapCache.has(violation.assetName)) {
                sourceMap = getAssetSourceMap(compilation, violation.assetName)
                sourceMapCache.set(violation.assetName, sourceMap)
            }
            result.set(violation, sourceMap ? await originalPositionFor(sourceMap, violation.generated) : undefined)
        }
        return result
    }
}

function getLegacyAssets(compilation: Compilation) {
    return Object.entries(compilation.assets ?? {}).map(([name, source]) => ({ name, source }))
}

function createWebpackError(compilation: Compilation, message: string) {
    const WebpackError = (compilation as any).compiler?.webpack?.WebpackError ?? Error
    return new WebpackError(message)
}

function toWebpackLocation(sourceLocation: SourceLocation | undefined, violation: Violation) {
    if (sourceLocation) {
        return {
            start: {
                line: sourceLocation.line,
                column: sourceLocation.column - 1,
            },
            end: {
                line: sourceLocation.line,
                column: sourceLocation.column - 1 + violation.expression.length,
            },
        }
    }

    return {
        start: {
            line: violation.generated.line,
            column: violation.generated.column,
        },
        end: {
            line: violation.generated.line,
            column: violation.generated.column + violation.expression.length,
        },
    }
}

function findErrorModule(compilation: Compilation, matches: ModuleMatch[], sourceLocation: SourceLocation | undefined) {
    if (!sourceLocation) return matches.find((match) => match.module)?.module
    const source = normalizePath(sourceLocation.source)
    return (
        findModuleBySource(compilation, source) ??
        matches.find((match) => match.module && sourceMatchesResource(source, match.resource))?.module ??
        matches.find((match) => match.module)?.module
    )
}

function findModuleBySource(compilation: Compilation, source: string) {
    for (const module of compilation.modules ?? []) {
        const resource = getModuleResource(module)
        if (resource && sourceMatchesResource(source, resource)) return module
    }
    return
}

function getAsset(compilation: Compilation, assetName: string) {
    return typeof compilation.getAsset === 'function' ?
            compilation.getAsset(assetName)
        :   getLegacyAssets(compilation).find((asset) => asset.name === assetName)
}

function getAssetSourceMap(compilation: Compilation, assetName: string): RawSourceMap | undefined {
    const asset = getAsset(compilation, assetName)
    const sourceAndMap = asset?.source?.sourceAndMap?.()
    const map = sourceAndMap?.map
    if (isRawSourceMap(map)) return map

    const mapAsset = getAsset(compilation, `${assetName}.map`)
    const mapSource = mapAsset?.source?.source?.()
    if (mapSource) return parseSourceMap(Buffer.isBuffer(mapSource) ? mapSource.toString('utf-8') : String(mapSource))

    const source = asset?.source?.source?.()
    const code = Buffer.isBuffer(source) ? source.toString('utf-8') : String(source ?? '')
    const inlineMap = code.match(
        /\/\/# sourceMappingURL=data:application\/json(?:;charset=utf-8)?;base64,([A-Za-z0-9+/=]+)\s*$/u,
    )
    if (inlineMap) return parseSourceMap(Buffer.from(inlineMap[1], 'base64').toString('utf-8'))
    return undefined
}

function parseSourceMap(value: string): RawSourceMap | undefined {
    try {
        const map = JSON.parse(value)
        return isRawSourceMap(map) ? map : undefined
    } catch {
        return undefined
    }
}

function isRawSourceMap(value: unknown): value is RawSourceMap {
    return (
        !!value &&
        typeof value === 'object' &&
        Array.isArray((value as RawSourceMap).sources) &&
        typeof (value as RawSourceMap).mappings === 'string'
    )
}

function getModuleResource(module: Module) {
    const candidate = module as any
    return candidate.resource ?? candidate.rootModule?.resource ?? module.identifier?.()
}

function getModuleSource(module: Module) {
    const candidate = module as any
    const source = module.originalSource?.()?.source?.() ?? candidate._source?.source?.()
    if (!source) return ''
    return Buffer.isBuffer(source) ? source.toString('utf-8') : String(source)
}

function sourceContainsViolation(source: string, violation: Violation) {
    if (source.includes(violation.literal)) return true
    if (violation.urls.some((url) => source.includes(url))) return true
    return violation.urls.some((url) => source.includes(url.split('.js')[0] + '.js'))
}

function offsetToPosition(source: string, offset: number): SourcePosition {
    let line = 1
    let lineStart = 0
    for (let index = 0; index < offset; index += 1) {
        if (source.charCodeAt(index) === 10) {
            line += 1
            lineStart = index + 1
        }
    }
    return { line, column: offset - lineStart }
}

async function originalPositionFor(map: RawSourceMap, generated: SourcePosition): Promise<SourceLocation | undefined> {
    const consumer = await new SourceMapConsumer(map)
    try {
        const position = consumer.originalPositionFor({
            line: generated.line,
            column: generated.column,
            bias: SourceMapConsumer.GREATEST_LOWER_BOUND,
        })
        if (!position.source || position.line === null || position.column === null) return undefined
        return {
            source: position.source,
            line: position.line,
            column: position.column + 1,
            name: position.name ?? undefined,
        }
    } finally {
        consumer.destroy()
    }
}

function packageNameFromResource(resource: string) {
    const normalized = normalizePath(resource)
    const nodeModulesIndex = normalized.lastIndexOf('/node_modules/')
    if (nodeModulesIndex !== -1) {
        const packagePath = normalized.slice(nodeModulesIndex + '/node_modules/'.length)
        const segments = packagePath.split('/')
        if (segments[0] === '.pnpm') {
            const nestedNodeModules = packagePath.indexOf('/node_modules/')
            if (nestedNodeModules !== -1)
                return packageNameFromNodeModulesPath(packagePath.slice(nestedNodeModules + '/node_modules/'.length))
        }
        return packageNameFromNodeModulesPath(packagePath)
    }
    return workspacePackageName(resource)
}

function sourceMatchesResource(source: string, resource: string) {
    const normalizedResource = normalizePath(resource)
    if (source === normalizedResource) return true
    if (source.endsWith(normalizedResource)) return true
    const nodeModulesIndex = normalizedResource.lastIndexOf('/node_modules/')
    return nodeModulesIndex !== -1 && source.endsWith(normalizedResource.slice(nodeModulesIndex + 1))
}

function normalizePath(path: string) {
    return path.replaceAll('\\', '/')
}

function packageNameFromNodeModulesPath(packagePath: string) {
    const segments = packagePath.split('/')
    if (!segments[0]) return
    if (segments[0].startsWith('@')) return segments[1] ? `${segments[0]}/${segments[1]}` : segments[0]
    return segments[0]
}

function workspacePackageName(resource: string) {
    let current = dirname(resource)
    while (current !== dirname(current)) {
        const cached = packageNameCache.get(current)
        if (cached) return cached
        const packageJSON = join(current, 'package.json')
        if (existsSync(packageJSON)) {
            try {
                const name = JSON.parse(readFileSync(packageJSON, 'utf-8')).name
                packageNameCache.set(current, name)
                return typeof name === 'string' ? name : undefined
            } catch {
                packageNameCache.set(current, undefined)
                return undefined
            }
        }
        current = dirname(current)
    }
    return undefined
}

function trimForMessage(value: string) {
    return value.length > 240 ? `${value.slice(0, 237)}...` : value
}
