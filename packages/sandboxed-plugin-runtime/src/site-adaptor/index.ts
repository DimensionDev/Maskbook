import { PluginRuntime } from '../runtime/runtime.js'
import { type BasicHostHooks, type BasicHostInstance, SandboxedPluginHost } from '../runtime/runner.js'
import { getURL } from '../utils/url.js'
import { addPeerDependencies } from '../peer-dependencies/index.js'
import { addPeerDependenciesDOM } from '../peer-dependencies-dom/index.js'
import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import { encoder } from '@masknet/shared-base'
import { isManifest } from '../utils/manifest.js'

export interface SiteAdaptorHostHooks extends BasicHostHooks {
    attachCompositionMetadata(pluginID: string, metaID: string, meta: unknown): void
    dropCompositionMetadata(pluginID: string, metaID: string): void
    closeApplicationBoardDialog(): void
}
export interface SiteAdaptorInstance extends BasicHostInstance {
    MetadataRender: Map<string, (meta: unknown) => unknown>
    CompositionEntry:
        | undefined
        | { label: React.ReactNode; dialog: React.ComponentType<{ open: boolean; onClose(): void }> }
    CompositionDialogMetadataBadgeRender(
        key: string,
        meta: unknown,
    ): { text: React.ReactNode; tooltip?: React.ReactNode } | null
}
export class SiteAdaptorPluginHost extends SandboxedPluginHost<SiteAdaptorHostHooks, SiteAdaptorInstance> {
    constructor(
        hooks: SiteAdaptorHostHooks,
        allowLocalOverrides: boolean,
        signal: AbortSignal = new AbortController().signal,
    ) {
        super(hooks, allowLocalOverrides, signal)
    }

    protected async HostStartPlugin(id: string, isLocal: boolean, signal: AbortSignal): Promise<SiteAdaptorInstance> {
        const manifest = await this.hooks.fetchManifest(id, isLocal)
        if (!isManifest(manifest)) throw new TypeError(`${id} does not have a valid manifest.`)

        const runtime = new PluginRuntime(id, isLocal ? `local-plugin-${id}` : `plugin-${id}`, {}, signal)
        addPeerDependencies(runtime)
        addPeerDependenciesDOM(runtime)

        const { content_script, rpc, rpcGenerator } = manifest.entries || {}
        const MetadataBadgeRender = new Map()
        const instance: SiteAdaptorInstance = {
            id,
            isLocal,
            runtime,
            MetadataRender: new Map(),
            CompositionEntry: undefined,
            CompositionDialogMetadataBadgeRender(
                key: string,
                meta: unknown,
            ): null | { text: React.ReactNode; tooltip?: React.ReactNode } {
                if (!MetadataBadgeRender.has(key)) return null
                const data = MetadataBadgeRender.get(key)!(meta)
                if (typeof data !== 'object') throw new TypeError('registerMetadataBadgeRender must return an object.')
                if (!data) return null
                if (!('text' in data))
                    throw new TypeError('registerMetadataBadgeRender must return an object with text.')
                const { text, tooltip } = data
                return { text, tooltip }
            },
        }
        this.bridgeRPC(instance, !!rpc, !!rpcGenerator)
        runtime.addNamespaceModule('@masknet/plugin/content-script', {
            attachMetadata: (metaID: string, value: unknown) => {
                if (typeof metaID !== 'string') throw new TypeError('Metadata key must be a string')
                if (arguments.length !== 2) throw new TypeError('attachMetadata requires two arguments')
                this.hooks.attachCompositionMetadata(id, metaID, value)
            },
            dropMetadata: (metaID: string) => {
                if (metaID !== 'string') throw new TypeError('Metadata key must be a string')
                this.hooks.dropCompositionMetadata(id, metaID)
            },
            closeApplicationBoardDialog: () => {
                this.hooks.closeApplicationBoardDialog()
            },
        })
        runtime.addNamespaceModule('@masknet/plugin/content-script/react', {
            registerMetadataRender: (metaID: string, render: (meta: unknown) => unknown) => {
                if (typeof metaID !== 'string') throw new TypeError('Metadata key must be a string')
                if (typeof render !== 'function') throw new TypeError('Metadata render must be a function')
                instance.MetadataRender.set(metaID, render)
            },
            registerMetadataBadgeRender: (metaID: string, render: (meta: unknown) => unknown) => {
                if (typeof metaID !== 'string') throw new TypeError('Metadata key must be a string')
                if (typeof render !== 'function') throw new TypeError('Metadata render must be a function')
                MetadataBadgeRender.set(metaID, render)
            },
            registerCompositionEntry: (label: unknown, dialog: unknown) => {
                instance.CompositionEntry = { label: label as any, dialog: dialog as any }
            },
        })

        runtime.addNamespaceModule('@masknet/plugin-hooks', {
            // TODO: implement this
            // TODO: move this to @masknet/plugin/content-script/react
            usePluginWrapper: () => void 0,
        })
        // TODO: implement this
        runtime.addNamespaceModule('@masknet/plugin/ui/showSnackbar', {
            showSnackbar: console.log,
        })
        // TODO: implement this
        runtime.addNamespaceModule('@masknet/plugin/ui/open', {
            openWindow: console.log,
        })
        if (content_script) await runtime.imports(getURL(id, content_script, isLocal))
        return instance
    }

    private bridgeRPC(instance: SiteAdaptorInstance, hasRPC: boolean, hasRPCGenerator: boolean) {
        if (!hasRPC && !hasRPCGenerator) return
        const { id, runtime } = instance

        const namespace: any = {}
        if (hasRPC) {
            namespace.worker = AsyncCall(null, {
                channel: this.hooks.createRpcChannel(id, this.signal),
                encoder,
                log: true,
                thenable: false,
                signal: this.signal,
            })
        }
        if (hasRPCGenerator) {
            namespace.workerGenerator = AsyncGeneratorCall(null, {
                channel: this.hooks.createRpcGeneratorChannel(id, this.signal),
                encoder,
                log: true,
                thenable: false,
                signal: this.signal,
            })
        }
        runtime.addNamespaceModule('@masknet/plugin/utils/rpc', namespace)
    }
}
