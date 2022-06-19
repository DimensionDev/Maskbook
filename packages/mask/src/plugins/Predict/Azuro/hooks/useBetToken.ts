import { useFungibleToken } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { contractAddresses } from '../../constants'

export function useBetToken(chainId: ChainId) {
    const { value: token } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        chainId === ChainId.Sokol ? contractAddresses[ChainId.Sokol]?.token : '',
    )
    return token
}
