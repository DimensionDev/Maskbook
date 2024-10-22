import { useSupportedChains, useTrade, type ShowTooltipOptions } from '@masknet/plugin-trader'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TokenType } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, SchemaType, type ChainId } from '@masknet/web3-shared-evm'
import { useCallback, useMemo } from 'react'
import { ChooseTokenModal, ConfirmModal } from '../../modals/modal-controls.js'
import { usePopupCustomSnackbar } from '@masknet/theme'

export function useImplementRuntime() {
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

            const picked = await ChooseTokenModal.openAndWaitForClose({
                // Only from token can decide the chain
                chainId: ((isSwap ? fromChainId : currentToken?.chainId) || chainId) as ChainId,
                address: currentToken?.address,
                chains: supportedChains?.map((x) => x.chainId),
                lockChainId: isSwap && side === 'to' && !!fromChainId,
            })
            if (!picked) return null
            return {
                id: picked.address,
                chainId: picked.chainId,
                type: TokenType.Fungible,
                name: picked.name,
                symbol: picked.symbol,
                decimals: picked.decimals,
                schema: isNativeTokenAddress(picked.address) ? SchemaType.Native : SchemaType.ERC20,
                address: picked.address,
            }
        },
        [isSwap, chainQuery.data, fromChainId],
    )

    const showToolTip = useCallback(({ title, message }: ShowTooltipOptions) => {
        ConfirmModal.open({
            title,
            message,
            disableConfirmButton: true,
            messageProps: {
                style: {
                    textAlign: 'left',
                },
            },
        })
    }, [])

    const { showSnackbar } = usePopupCustomSnackbar()

    return useMemo(
        () => ({ pickToken, basepath: '/trader', showToolTip, showSnackbar }),
        [pickToken, showToolTip, showSnackbar],
    )
}
