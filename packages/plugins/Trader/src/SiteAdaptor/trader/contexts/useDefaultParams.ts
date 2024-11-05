import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNativeToken } from '@masknet/web3-hooks-base'
import { useOKXTokenList } from '@masknet/web3-hooks-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useSearchParams } from 'react-router-dom'
import { base } from '../../../base.js'

const supportedChainIds = base.enableRequirement.web3[NetworkPluginID.PLUGIN_EVM].supportedChainIds

export function useDefaultParams() {
    const [params] = useSearchParams()
    const rawToChainId = params.get('toChainId')
    const toChainId = rawToChainId ? +rawToChainId : undefined
    const toAddress = toChainId && supportedChainIds.includes(toChainId) ? params.get('toAddress') : undefined
    const { chainId: contextChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const chainId = toChainId || contextChainId
    const defaultChainId = supportedChainIds.includes(chainId) ? chainId : ChainId.Mainnet
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { data: tokens } = useOKXTokenList(chainId)
    const paramToToken = toAddress && tokens ? tokens.find((x) => isSameAddress(x.address, toAddress)) : undefined

    return {
        chainId: defaultChainId,
        toAddress,
        nativeToken,
        paramToToken,
    }
}
