import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useSharedI18N } from '../../../locales/index.js'
import { makeStyles, ActionButtonProps, ActionButton } from '@masknet/theme'
import { useMemo } from 'react'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { useERC721ContractIsApproveForAll, useERC721ContractSetApproveForAllCallback } from '@masknet/web3-hooks-evm'

const useStyles = makeStyles()(() => ({}))

export interface EthereumERC712TokenApprovedBoundaryProps extends withClasses<'approveButton'> {
    children?: React.ReactNode
    owner: string | undefined
    contractDetailed: NonFungibleTokenContract<ChainId, SchemaType.ERC721> | undefined
    validationMessage?: string
    operator: string | undefined
    ActionButtonProps?: ActionButtonProps
}

export function EthereumERC721TokenApprovedBoundary(props: EthereumERC712TokenApprovedBoundaryProps) {
    const { owner, contractDetailed, operator, children, validationMessage: _validationMessage } = props
    const t = useSharedI18N()
    const { Others } = useWeb3State()
    const { classes } = useStyles(undefined, { props })
    const { value, loading, retry } = useERC721ContractIsApproveForAll(contractDetailed?.address, owner, operator)
    const [approveState, approveCallback] = useERC721ContractSetApproveForAllCallback(
        contractDetailed?.address,
        operator,
        true,
        retry,
    )

    const validationMessage = useMemo(() => {
        if (!contractDetailed?.address || !Others?.isValidAddress(contractDetailed?.address))
            return t.plugin_wallet_select_a_nft_contract()
        if (!owner || !Others?.isValidAddress(owner)) return t.plugin_wallet_select_a_nft_owner()
        if (!operator || !Others?.isValidAddress(operator)) return t.plugin_wallet_select_a_nft_operator()
        if (_validationMessage) return _validationMessage
        return ''
    }, [contractDetailed, owner, operator, _validationMessage])

    if (approveState.loading) {
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                fullWidth
                loading
                disabled
                {...props.ActionButtonProps}>
                {t.plugin_wallet_nft_approving_all({
                    symbol: contractDetailed?.symbol
                        ? contractDetailed.symbol.toLowerCase() === 'unknown'
                            ? 'All'
                            : contractDetailed?.symbol
                        : 'All',
                })}
            </ActionButton>
        )
    } else if (validationMessage) {
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                fullWidth
                disabled
                {...props.ActionButtonProps}>
                {validationMessage}
            </ActionButton>
        )
    } else if (loading) {
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                fullWidth
                loading
                disabled
                {...props.ActionButtonProps}
            />
        )
    } else if (value === false) {
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                fullWidth
                onClick={approveCallback}
                {...props.ActionButtonProps}>
                {t.plugin_wallet_approve_all_nft({
                    symbol: contractDetailed?.symbol
                        ? contractDetailed?.symbol.toLowerCase() === 'unknown'
                            ? 'All'
                            : contractDetailed?.symbol
                        : 'All',
                })}
            </ActionButton>
        )
    } else if (value === undefined) {
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                fullWidth
                onClick={retry}
                {...props.ActionButtonProps}>
                {t.plugin_wallet_fail_to_load_nft_contract()}
            </ActionButton>
        )
    }

    return <>{children}</>
}
