import { NetworkPluginID } from '../Plugin/index.js'
/**
 * All integrated name service IDs
 */
export enum NameServiceID {
    EVM = 'com.mask.ns.evm',
    BSC = 'com.mask.ns.bsc',
    FLOW = 'com.mask.ns.flow',
    SOLANA = 'com.mask.ns.solana',
}

export const NAME_SERVICE_NETWORK_MAPPING: Record<NameServiceID, NetworkPluginID> = {
    [NameServiceID.EVM]: NetworkPluginID.PLUGIN_EVM,
    [NameServiceID.BSC]: NetworkPluginID.PLUGIN_EVM,
    [NameServiceID.FLOW]: NetworkPluginID.PLUGIN_FLOW,
    [NameServiceID.SOLANA]: NetworkPluginID.PLUGIN_SOLANA,
}
