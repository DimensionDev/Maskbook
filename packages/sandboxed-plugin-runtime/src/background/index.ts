import { PluginRuntime } from '../runtime/runtime.js'
import { BasicHostHooks, BasicHostInstance, PluginRunner } from '../runtime/runner.js'
import { getURL } from '../utils/url.js'
import { addPeerDependencies } from '../peer-dependencies/index.js'
import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import { serializer } from '@masknet/shared-base'
import { isManifest } from '../utils/manifest.js'
import type { ExportAllBinding } from '@masknet/compartment'
import type { BackupHandler } from '../types/worker-api.js'

export interface BackgroundHostHooks extends BasicHostHooks {
    // TODO: return type should be Plugin.Worker.DatabaseStorage
    createTaggedStorage(id: string, signal: AbortSignal): unknown
}
export interface BackgroundInstance extends BasicHostInstance {
    backupHandler?: BackupHandler
}
export class BackgroundPluginHost extends PluginRunner<BackgroundHostHooks, BackgroundInstance> {
    constructor(
        hooks: BackgroundHostHooks,
        allowLocalOverrides: boolean,
        signal: AbortSignal = new AbortController().signal,
    ) {
        super(hooks, allowLocalOverrides, signal)
    }

    protected async HostStartPlugin(id: string, isLocal: boolean, signal: AbortSignal): Promise<BackgroundInstance> {
        const manifest = await this.hooks.fetchManifest(id, isLocal)
        if (!isManifest(manifest)) throw new TypeError(`${id} does not have a valid manifest.`)

        const runtime = new PluginRuntime(id, isLocal ? `local-plugin-${id}` : `plugin-${id}`, {}, signal)
        addPeerDependencies(runtime)
        runtime.addNamespaceModule('@masknet/plugin/worker', {
            addBackupHandler(handler: BackupHandler) {
                const { onBackup, onRestore } = handler
                if (typeof onBackup !== 'function' || typeof onRestore !== 'function')
                    throw new TypeError('BackupHandler must have onBackup and onRestore functions.')

                instance.backupHandler = { onBackup, onRestore }
                console.debug(`${id} attached a backup handler.`)
            },
            taggedStorage: this.hooks.createTaggedStorage(id, signal),
        })

        const { background, rpc, rpcGenerator } = manifest.entries || {}
        const instance: BackgroundInstance = {
            id,
            isLocal,
            runtime,
        }
        if (background) await runtime.imports(getURL(id, background, isLocal))
        await this.startRPC(instance, rpc, rpcGenerator)
        return instance
    }

    private async startRPC(instance: BackgroundInstance, rpc: string | undefined, rpcGenerator: string | undefined) {
        if (!rpc && !rpcGenerator) return
        const { id, isLocal, runtime } = instance

        const rpcReExports: ExportAllBinding[] = []
        if (rpc) rpcReExports.push({ exportAllFrom: getURL(id, rpc, isLocal), as: 'worker' })
        if (rpcGenerator) rpcReExports.push({ exportAllFrom: getURL(id, rpcGenerator, isLocal), as: 'workerGenerator' })
        runtime.addReExportModule('@masknet/plugin/utils/rpc', ...rpcReExports)

        const rpcReExport = await runtime.imports('@masknet/plugin/utils/rpc')
        if (rpc) {
            AsyncCall(rpcReExport.worker, {
                channel: this.hooks.createRpcChannel(id, this.signal),
                serializer,
                log: true,
                thenable: false,
            })
        }
        if (rpcGenerator) {
            AsyncGeneratorCall(rpcReExport.workerGenerator, {
                channel: this.hooks.createRpcGeneratorChannel(id, this.signal),
                serializer,
                log: true,
                thenable: false,
            })
        }
    }
}
