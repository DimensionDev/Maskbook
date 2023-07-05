/// <reference types="@masknet/global-types/module-loader" />

import {
    imports,
    type Module,
    Evaluators,
    type VirtualModuleRecord,
    type ExportAllBinding,
    type ExportBinding,
} from '@masknet/compartment'
import type { MembraneInstance } from '@masknet/membrane'
import { createGlobal } from './global.js'

export class PluginRuntime {
    declare readonly id: string
    constructor(
        id: string,
        private origin: string,
        manifest: unknown,
        signal: AbortSignal,
    ) {
        const { localThis, membrane } = createGlobal(id, manifest, signal)

        Object.defineProperty(this, 'id', { value: id })
        this.globalThis = membrane.execute(() => localThis)
        this.#membrane = membrane
        this.#signal = signal
        this.#Module = new Evaluators({ globalThis: localThis }).Module
    }
    async imports(specifier: string) {
        const module = await this.#importHook(undefined, specifier)
        // Note: moduleNamespace is a Blue::Promise<Red::ModuleNamespace>
        //       and it might become a Blue::Promise<Red::any> if there is a "then()" method defined.
        const moduleNamespace = await imports(module)
        return this.#membrane.execute(() => moduleNamespace)
    }
    globalThis: typeof globalThis

    #moduleMap = new Map<string, VirtualModuleRecord>()
    addReExportModule(moduleName: string, ...bindings: Array<ExportBinding | ExportAllBinding>) {
        if (this.#moduleMap.has(moduleName)) throw new TypeError('Module is already defined.')
        this.#moduleMap.set(moduleName, { bindings })
    }
    addReExportAllModule(moduleName: string, from: string[]) {
        this.#moduleMap.set(moduleName, { bindings: from.map((x) => ({ exportAllFrom: x })) })
    }
    addNamespaceModule(moduleName: string, blueNamespace: object) {
        if (this.#moduleMap.has(moduleName)) throw new TypeError('Module is already defined.')
        const keys = Object.keys(blueNamespace)
        this.#moduleMap.set(moduleName, {
            bindings: keys.map((key) => ({ export: key })),
            execute: (redEnvironment) => {
                function copyNamespace(redNamespace: any) {
                    for (const k of keys) redEnvironment[k] = redNamespace[k]
                }
                Object.freeze(copyNamespace)
                this.#membrane.execute(() => copyNamespace)(blueNamespace)
            },
        })
    }

    // internals
    #instanceFromURL = new Map<string, Module>()
    async #loadHook(specifier: string, referral: string | undefined) {
        if (!specifier.startsWith('.') && !specifier.startsWith('mask-modules://')) {
            if (this.#moduleMap.has(specifier))
                return { normalizedURL: specifier, source: this.#moduleMap.get(specifier)! }
            else throw new SyntaxError(`Module not found: ${specifier}`)
        }

        // normalize URL
        const target = new URL(specifier, referral?.includes('://') ? referral : undefined)
        const oldProtocol = target.protocol
        target.protocol = 'https:'
        target.protocol = oldProtocol
        const normalizedURL = target.href

        if (oldProtocol === 'mask-modules:' && !normalizedURL.startsWith('mask-modules://' + this.origin + '/')) {
            throw new SyntaxError('Import from other plugin is not supported. Try to import: ' + normalizedURL)
        }

        const source: VirtualModuleRecord = await __mask__module__reflection__(normalizedURL)

        return { normalizedURL, source }
    }
    async #importHook(referral: string | undefined, specifier: string): Promise<Module> {
        this.#signal.throwIfAborted()
        const { normalizedURL, source } = await this.#loadHook(specifier, referral)

        if (this.#instanceFromURL.has(normalizedURL)) return this.#instanceFromURL.get(normalizedURL)!
        const instance = new this.#Module(source, {
            importHook: this.#importHook.bind(this, normalizedURL),
            importMetaHook: source.needsImportMeta ? (meta) => Object.assign(meta, { url: normalizedURL }) : undefined,
        })
        this.#instanceFromURL.set(normalizedURL, instance)
        return instance
    }
    #signal: AbortSignal
    #Module: typeof Module
    #membrane: MembraneInstance
}
