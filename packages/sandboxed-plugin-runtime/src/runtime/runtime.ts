/// <reference types="@masknet/global-types/module-loader" />

import { imports, type Module, Evaluators, Referral, VirtualModuleRecord } from '@masknet/compartment'
import type { MembraneInstance } from '@masknet/membrane'
import { createGlobal } from './global.js'

export class PluginRuntime {
    declare readonly id: string
    constructor(id: string, manifest: unknown, signal: AbortSignal) {
        const { localThis, membrane } = createGlobal(id, manifest, signal)

        Object.defineProperty(this, 'id', { value: id })
        this.globalThis = membrane.execute(() => localThis)
        this.#membrane = membrane
        this.#signal = signal
        this.#Module = new Evaluators({
            globalThis: localThis,
            importHook: this.#importHook.bind(this),
        }).Module
    }
    async imports(specifier: string) {
        const module = await this.#importHook(specifier, undefined)
        // Note: moduleNamespace is a Blue::Promise<Red::ModuleNamespace>
        //       and it might become a Blue::Promise<Red::any> if there is a "then()" method defined.
        const moduleNamespace = await imports(module)
        return this.#membrane.execute(() => moduleNamespace)
    }
    globalThis: typeof globalThis

    #moduleMap = new Map<string, VirtualModuleRecord>()
    addModule = this.#moduleMap.set.bind(this.#moduleMap)

    // internals
    #instanceFromURL = new Map<string, Module>()
    async #loadHook(specifier: string, referral: Referral | undefined) {
        if (typeof referral !== 'string' && referral !== undefined)
            throw new TypeError('Internal error: referral is not a string or undefined.')

        if (!specifier.startsWith('.') && !specifier.startsWith('mask-modules://')) {
            if (this.#moduleMap.has(specifier))
                return { normalizedURL: specifier, source: this.#moduleMap.get(specifier)! }
            else throw new SyntaxError(`Module not found: ${specifier}`)
        }

        // normalize URL
        const target = new URL(specifier, referral)
        const oldProtocol = target.protocol
        target.protocol = 'https:'
        target.protocol = oldProtocol
        const normalizedURL = target.href

        if (oldProtocol === 'mask-modules:' && !normalizedURL.startsWith('mask-modules://plugin-' + this.id + '/')) {
            throw new SyntaxError('Import from other plugin is not supported.')
        }

        const source = await __mask__module__reflection__(normalizedURL)

        return { normalizedURL, source }
    }
    async #importHook(specifier: string, referral: Referral | undefined): Promise<Module> {
        this.#signal.throwIfAborted()
        const { normalizedURL, source } = await this.#loadHook(specifier, referral)

        if (this.#instanceFromURL.has(normalizedURL)) return this.#instanceFromURL.get(normalizedURL)!
        const importMeta: ImportMeta = { url: normalizedURL }
        const instance = new this.#Module(source, normalizedURL, this.#importHook.bind(this), importMeta)
        this.#instanceFromURL.set(normalizedURL, instance)
        return instance
    }
    #signal: AbortSignal
    #Module: typeof Module
    #membrane: MembraneInstance
}
