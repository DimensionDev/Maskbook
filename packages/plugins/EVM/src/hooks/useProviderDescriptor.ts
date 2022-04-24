import { useProviderType } from '@masknet/plugin-infra/src/web3'
import { NetworkPluginID } from '@masknet/plugin-infra/src/web3-types'
import { PLUGIN_PROVIDERS } from '../constants'

export function useProviderDescriptor() {
    const providerType = useProviderType(NetworkPluginID.PLUGIN_EVM)
    return PLUGIN_PROVIDERS.find((x) => x.type === providerType) ?? null
}
