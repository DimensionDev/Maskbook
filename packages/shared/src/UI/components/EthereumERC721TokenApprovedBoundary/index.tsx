import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useSharedI18N } from '../../../locales/index.js'
import { type ActionButtonProps, ActionButton } from '@masknet/theme'
import { useEffect, useMemo } from 'react'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { useERC721ContractIsApproveForAll, useERC721ContractSetApproveForAllCallback } from '@masknet/web3-hooks-evm'

export interface EthereumERC712TokenApprovedBoundaryProps extends withClasses<'approveButton'> {
    children?: React.ReactNode
    owner: string | undefined
    chainId: ChainId
    collection: NonFungibleCollection<ChainId, SchemaType> | undefined
    validationMessage?: string
    operator: string | undefined
    ActionButtonProps?: ActionButtonProps
}

export function EthereumERC721TokenApprovedBoundary(props: EthereumERC712TokenApprovedBoundaryProps) {
    const { owner, collection, operator, children, validationMessage: _validationMessage, chainId } = props
    const t = useSharedI18N()
    const { Others } = useWeb3State()
    const {
        value: isApproveForAll,
        loading,
        retry,
    } = useERC721ContractIsApproveForAll(collection?.address, owner, operator, chainId)
    const [approveState, approveCallback] = useERC721ContractSetApproveForAllCallback(
        collection?.address,
        operator,
        true,
        retry,
        chainId,
    )

    useEffect(() => {
        retry()
    }, [approveState.loading])
    const validationMessage = useMemo(() => {
        if (!collection?.address || !Others?.isValidAddress(collection?.address))
            return t.plugin_wallet_select_a_nft_contract()
        if (!owner || !Others?.isValidAddress(owner)) return t.plugin_wallet_select_a_nft_owner()
        if (!operator || !Others?.isValidAddress(operator)) return t.plugin_wallet_select_a_nft_operator()
        if (_validationMessage) return _validationMessage
        return ''
    }, [collection, owner, operator, _validationMessage])

    if (approveState.loading) {
        return (
            <ActionButton variant="contained" fullWidth loading disabled {...props.ActionButtonProps}>
                {t.plugin_wallet_nft_approving_all({
                    symbol: collection?.symbol
                        ? collection.symbol.toLowerCase() === 'unknown'
                            ? 'All'
                            : collection?.symbol
                        : 'All',
                })}
            </ActionButton>
        )
    } else if (validationMessage) {
        return (
            <ActionButton variant="contained" fullWidth disabled {...props.ActionButtonProps}>
                {validationMessage}
            </ActionButton>
        )
    } else if (loading) {
        return <ActionButton variant="contained" fullWidth loading disabled {...props.ActionButtonProps} />
    } else if (isApproveForAll === false) {
        return (
            <ActionButton variant="contained" fullWidth onClick={approveCallback} {...props.ActionButtonProps}>
                {t.plugin_wallet_approve_all_nft({
                    symbol: collection?.symbol
                        ? collection?.symbol.toLowerCase() === 'unknown'
                            ? 'All'
                            : collection?.symbol
                        : 'All',
                })}
            </ActionButton>
        )
    } else if (isApproveForAll === undefined) {
        return (
            <ActionButton variant="contained" fullWidth onClick={retry} {...props.ActionButtonProps}>
                {t.plugin_wallet_fail_to_load_nft_contract()}
            </ActionButton>
        )
    }

    return <>{children}</>
}
