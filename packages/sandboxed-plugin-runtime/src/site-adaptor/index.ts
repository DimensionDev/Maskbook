import { PluginRuntime } from '../runtime/runtime.js'
import { BasicHostHooks, BasicHostInstance, PluginRunner } from '../runtime/runner.js'
import { getURL } from '../utils/url.js'
import { addPeerDependencies } from '../peer-dependencies/index.js'
import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import { serializer } from '@masknet/shared-base'
import { isManifest } from '../utils/manifest.js'
import type { BackupHandler } from '../types/worker-api.js'

export interface SiteAdaptorHostHooks extends BasicHostHooks {}
export interface SiteAdaptorInstance extends BasicHostInstance {
    backupHandler?: BackupHandler
}
export class SiteAdaptorPluginHost extends PluginRunner<SiteAdaptorHostHooks, SiteAdaptorInstance> {
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

        const { content_script, rpc, rpcGenerator } = manifest.entries || {}
        const instance: SiteAdaptorInstance = {
            id,
            isLocal,
            runtime,
        }
        this.bridgeRPC(instance, !!rpc, !!rpcGenerator)
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
                serializer,
                log: true,
                thenable: false,
            })
        }
        if (hasRPCGenerator) {
            namespace.workerGenerator = AsyncGeneratorCall(null, {
                channel: this.hooks.createRpcGeneratorChannel(id, this.signal),
                serializer,
                log: true,
                thenable: false,
            })
        }
        runtime.addNamespaceModule('@masknet/plugin/utils/rpc', namespace)
    }
}
