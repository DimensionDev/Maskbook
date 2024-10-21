import { SelectFungibleTokenModal } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { noop } from 'lodash-es'
import { useCallback, useMemo } from 'react'
import type { RuntimeOptions } from './contexts/RuntimeProvider.js'
import { useTrade } from './contexts/TradeProvider.js'
import { useSupportedChains } from './hooks/useSupportedChains.js'

export function useImplementRuntime(): RuntimeOptions {
    const chainQuery = useSupportedChains()
    const { mode, chainId, fromToken } = useTrade()
    const isSwap = mode === 'swap'
    const fromChainId = fromToken?.chainId as ChainId
    const pickToken = useCallback(
        async (
            currentToken: Web3Helper.FungibleTokenAll | null | undefined,
            side: 'from' | 'to',
            excludes: string[],
        ): Promise<Web3Helper.FungibleTokenAll | null> => {
            const supportedChains = chainQuery.data ?? (await chainQuery.refetch()).data
            return SelectFungibleTokenModal.openAndWaitForClose({
                disableNativeToken: false,
                selectedTokens: excludes,
                // Only from token can decide the chain
                chainId: (isSwap ? fromChainId : currentToken?.chainId) || chainId,
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chains: supportedChains?.map((x) => x.chainId),
                okxOnly: true,
                lockChainId: isSwap && side === 'to' && !!fromChainId,
            })
        },
        [isSwap, chainQuery.data, fromChainId],
    )
    return useMemo(() => ({ pickToken, basepath: '', showToolTip: noop }), [pickToken])
}
