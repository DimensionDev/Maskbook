import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useI18N } from '../../utils'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import ActionButton, { ActionButtonProps } from '../../extension/options-page/DashboardComponents/ActionButton'
import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { NonFungibleTokenContract } from '@masknet/web3-shared-base'
import {
    useERC721ContractIsApproveForAll,
    useERC721ContractSetApproveForAllCallback,
} from '@masknet/plugin-infra/web3-evm'

const useStyles = makeStyles()(() => ({
    snackBarText: {
        fontSize: 14,
    },
    snackBarLink: {
        color: 'white',
    },
    openIcon: {
        display: 'flex',
        width: 18,
        height: 18,
        marginLeft: 2,
    },
    snackBar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: 'translateY(1px)',
    },
}))

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
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { value, loading, retry } = useERC721ContractIsApproveForAll(contractDetailed?.address, owner, operator)
    const [approveState, approveCallback] = useERC721ContractSetApproveForAllCallback(
        contractDetailed?.address,
        operator,
        true,
    )

    const validationMessage = useMemo(() => {
        if (!contractDetailed?.address || !EthereumAddress.isValid(contractDetailed?.address))
            return t('plugin_wallet_select_a_nft_contract')
        if (!owner || !EthereumAddress.isValid(owner)) return t('plugin_wallet_select_a_nft_owner')
        if (!operator || !EthereumAddress.isValid(operator)) return t('plugin_wallet_select_a_nft_operator')
        if (_validationMessage) return _validationMessage
        return ''
    }, [contractDetailed, owner, operator, _validationMessage])

    if (approveState.loading) {
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                size="large"
                fullWidth
                loading
                disabled
                {...props.ActionButtonProps}>
                {t('plugin_wallet_nft_approving_all', {
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
                size="large"
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
                size="large"
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
                size="large"
                fullWidth
                onClick={approveCallback}
                {...props.ActionButtonProps}>
                {t('plugin_wallet_approve_all_nft', {
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
                size="large"
                fullWidth
                onClick={retry}
                {...props.ActionButtonProps}>
                {t('plugin_wallet_fail_to_load_nft_contract')}
            </ActionButton>
        )
    }

    return <>{children}</>
}
