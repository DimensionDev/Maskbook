import type { EventBasedChannel } from 'async-call-rpc'
import type { PluginRuntime } from './runtime.js'
import { combineAbortSignal } from '@masknet/kit'

interface PluginListItem {
    normal?: boolean
    local?: boolean
    locales?: Array<{ url: string; language: string }>
}
export interface BasicHostHooks {
    getPluginList(): Promise<Iterable<[string, PluginListItem]>>
    fetchManifest(id: string, isLocal: boolean): Promise<object>
    fetchLocaleFiles(id: string, isLocal: boolean, languages: Array<{ url: string; language: string }>): void
    createRpcChannel(id: string, signal: AbortSignal): EventBasedChannel
    createRpcGeneratorChannel(id: string, signal: AbortSignal): EventBasedChannel
}
export interface BasicHostInstance {
    id: string
    isLocal: boolean
    runtime: PluginRuntime
}

export abstract class SandboxedPluginHost<
    HostHooks extends BasicHostHooks,
    HostPluginInstance extends BasicHostInstance,
> {
    constructor(
        protected readonly hooks: HostHooks,
        protected readonly allowLocalOverrides: boolean,
        protected readonly signal: AbortSignal = new AbortController().signal,
    ) {
        signal.throwIfAborted()
        signal.addEventListener(
            'abort',
            () => {
                for (const id of this.plugins.keys()) this.stopPlugin(id)
            },
            { once: true },
        )
    }
    protected abstract HostStartPlugin(id: string, isLocal: boolean, signal: AbortSignal): Promise<HostPluginInstance>
    protected readonly plugins = new Map<string, [instance: HostPluginInstance, isLocal: boolean, abort: () => void]>()
    protected pluginList: ReadonlyMap<string, PluginListItem> = new Map()

    getPluginInstance(id: string) {
        return this.plugins.get(id)
    }

    __builtInPluginInfraBridgeCallback__: ((this: this, id: string) => void) | undefined = undefined;
    *iteratePluginInstance() {
        for (const [instance] of this.plugins.values()) yield instance
    }

    async onPluginListUpdate() {
        const list = new Map(await this.hooks.getPluginList())
        this.pluginList = list

        for (const [id] of list) this.__builtInPluginInfraBridgeCallback__?.(id)
    }

    async init_unbridged() {
        const list = this.pluginList

        for (const [id, [, isLocal]] of this.plugins) {
            // Stop plugin if they disappeared from the new list.
            if (!list.has(id)) this.stopPlugin(id)
            // Stop plugin if it is loaded with a different profile (local to formal or reverse)
            else if ((list.get(id)!.local && !isLocal) || (list.get(id)!.normal && isLocal)) this.stopPlugin(id)
        }

        // start new plugin
        // TODO: check plugin start condition before call start
        // TODO: start plugin in dependency DFS order?
        for (const [id, data] of list) {
            if (this.plugins.has(id)) continue

            const abort = new AbortController()
            const isLocal = !!(data.local && this.allowLocalOverrides)
            this.hooks.fetchLocaleFiles(id, isLocal, this.pluginList.get(id)?.locales ?? [])
            this.startPluginInner(id, isLocal, abort.signal, abort.abort.bind(abort))
        }
    }
    async startPlugin_bridged(id: string, signal: AbortSignal) {
        const abort = new AbortController()
        const isLocal = !!(this.pluginList.get(id)!.local && this.allowLocalOverrides)
        this.hooks.fetchLocaleFiles(id, isLocal, this.pluginList.get(id)?.locales ?? [])
        await this.startPluginInner(id, isLocal, combineAbortSignal(abort.signal, signal), abort.abort.bind(abort))
        return this.plugins.get(id)!
    }

    protected async startPluginInner(id: string, isLocal: boolean, signal: AbortSignal, abortFunction: () => void) {
        this.signal.throwIfAborted()

        // TODO: setup a module & fetch alias from normal version to local version
        const instance = await this.HostStartPlugin(id, isLocal, signal)
        this.plugins.set(id, [instance, isLocal, abortFunction])
    }

    protected stopPlugin(id: string) {
        // TODO: stop plugin in dependency DFS order?
        if (!this.plugins.has(id)) return
        const [, , abort] = this.plugins.get(id)!
        abort()
        this.plugins.delete(id)
    }
}
