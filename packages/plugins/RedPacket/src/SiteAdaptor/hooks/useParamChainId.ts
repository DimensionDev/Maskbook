import { NetworkPluginID } from '@masknet/shared-base'
import { base } from '../../base.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'

export function useParamChainId() {
    const [searchParams, setParams] = useSearchParams()
    const chainIds = base.enableRequirement.web3[NetworkPluginID.PLUGIN_EVM].supportedChainIds
    const { chainId: contextChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const defaultChainId = chainIds.includes(contextChainId) ? contextChainId : ChainId.Mainnet
    const chainId = (Number(searchParams.get('chainId')) as ChainId) || defaultChainId

    const setChainId = useCallback(
        (chainId: ChainId) => {
            setParams(
                (params) => {
                    params.set('chainId', String(chainId))
                    return params.toString()
                },
                { replace: true },
            )
        },
        [setParams],
    )

    return [chainId, setChainId] as const
}
