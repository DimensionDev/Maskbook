import { PluginRuntime } from '../runtime/runtime.js'
import { type BasicHostHooks, type BasicHostInstance, SandboxedPluginHost } from '../runtime/runner.js'
import { getURL } from '../utils/url.js'
import { addPeerDependencies } from '../peer-dependencies/index.js'
import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import { encoder } from '@masknet/shared-base'
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
export class BackgroundPluginHost extends SandboxedPluginHost<BackgroundHostHooks, BackgroundInstance> {
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
            registerBackupHandler(handler: BackupHandler) {
                if (!manifest.contributes?.backup) {
                    throw new Error(
                        'Refuse to register the backup handler because manifest.contributes.backup is not true.',
                    )
                }
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
        await this.bindRPC(instance, rpc, rpcGenerator)
        if (background) await runtime.imports(getURL(id, background, isLocal))
        await this.startService(instance, !!rpc, !!rpcGenerator)
        return instance
    }

    private async bindRPC(instance: BackgroundInstance, rpc: string | undefined, rpcGenerator: string | undefined) {
        if (!rpc && !rpcGenerator) return

        const rpcReExports: ExportAllBinding[] = []
        if (rpc) rpcReExports.push({ exportAllFrom: getURL(instance.id, rpc, instance.isLocal), as: 'worker' })
        if (rpcGenerator)
            rpcReExports.push({
                exportAllFrom: getURL(instance.id, rpcGenerator, instance.isLocal),
                as: 'workerGenerator',
            })
        instance.runtime.addReExportModule('@masknet/plugin/utils/rpc', ...rpcReExports)
    }
    private async startService(instance: BackgroundInstance, hasRPC: boolean, hasRPCGenerator: boolean) {
        const rpcReExport = await instance.runtime.imports('@masknet/plugin/utils/rpc')
        if (hasRPC) {
            AsyncCall(rpcReExport.worker, {
                channel: this.hooks.createRpcChannel(instance.id, this.signal),
                encoder,
                log: true,
                thenable: false,
                signal: this.signal,
            })
        }
        if (hasRPCGenerator) {
            AsyncGeneratorCall(rpcReExport.workerGenerator, {
                channel: this.hooks.createRpcGeneratorChannel(instance.id, this.signal),
                encoder,
                log: true,
                thenable: false,
                signal: this.signal,
            })
        }
    }
}
