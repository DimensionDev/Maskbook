import type { EventBasedChannel } from 'async-call-rpc'
export interface BasicHostHooks {
    getPluginList(): Promise<Iterable<[string, { normal?: boolean; local?: boolean }]>>
    fetchManifest(id: string, isLocal: boolean): Promise<object>
    createRpcChannel(id: string, signal: AbortSignal): EventBasedChannel
    createRpcGeneratorChannel(id: string, signal: AbortSignal): EventBasedChannel
}
export interface Runner<HostPluginInstance> {
    onPluginListUpdate(): void
    getPluginInstance(id: string): undefined | HostPluginInstance
}

export abstract class PluginRunner<HostHooks extends BasicHostHooks, HostPluginInstance> {
    constructor(
        protected hooks: HostHooks,
        protected allowLocalOverrides: boolean,
        protected signal: AbortSignal = new AbortController().signal,
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
    protected plugins = new Map<string, [instance: HostPluginInstance, isLocal: boolean, abort: () => void]>()

    init() {
        return this.onPluginListUpdate()
    }

    async onPluginListUpdate() {
        const list = new Map(await this.hooks.getPluginList())
        this.signal.throwIfAborted()

        for (const [id, [, isLocal]] of this.plugins) {
            // Stop plugin if they disappeared from the new list.
            if (!list.has(id)) this.stopPlugin(id)
            // Stop plugin if it is loaded with a different profile (local to formal or reverse)
            else if ((list.get(id)!.local && !isLocal) || (list.get(id)!.normal && isLocal)) this.stopPlugin(id)
        }

        // start new plugin
        // TODO: start plugin in dependency DFS order?
        for (const [id, data] of list) {
            if (this.plugins.has(id)) continue

            if (data.local && !this.allowLocalOverrides) continue
            this.startPlugin(id, !!data.local)
        }
    }
    protected async startPlugin(id: string, isLocal: boolean) {
        this.signal.throwIfAborted()

        const abort = new AbortController()
        try {
            // TODO: setup a module & fetch alias from normal version to local version
            const instance = await this.HostStartPlugin(id, isLocal, abort.signal)
            this.plugins.set(id, [instance, isLocal, abort.abort.bind(abort)])
        } catch (error) {
            console.error(`[Sandboxed-plugin] Plugin ${id} stopped due to an error when starting.`, error)
        }
    }

    protected stopPlugin(id: string) {
        // TODO: stop plugin in dependency DFS order?
        if (!this.plugins.has(id)) return
        const [, , abort] = this.plugins.get(id)!
        abort()
        this.plugins.delete(id)
    }
}
