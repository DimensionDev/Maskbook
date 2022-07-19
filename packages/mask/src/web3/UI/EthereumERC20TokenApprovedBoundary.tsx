import { Tooltip } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { unreachable } from '@dimensiondev/kit'
import { useI18N } from '../../utils'
import ActionButton, { ActionButtonProps } from '../../extension/options-page/DashboardComponents/ActionButton'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { ApproveStateType, useERC20TokenApproveCallback } from '@masknet/plugin-infra/web3-evm'
import { TokenIcon } from '@masknet/shared'
import { HelpOutline } from '@mui/icons-material'
import React, { useCallback } from 'react'

const useStyles = makeStyles()((theme) => ({
    container: {},
    button: {
        whiteSpace: 'nowrap',
    },
    buttonLabel: {
        display: 'block',
        fontWeight: 'inherit',
        transform: 'translateY(-4px)',
    },
    buttonAmount: {
        fontSize: 10,
        fontWeight: 300,
        transform: 'translateY(12px)',
        position: 'absolute',
    },
    children: {
        marginTop: 8,
        width: '100%',
    },
    icon: {
        width: 18,
        height: 18,
    },
    helpIcon: {
        width: 18,
        height: 18,
        color: theme.palette.maskColor?.second,
    },
    tooltip: {
        padding: 10,
        textAlign: 'left',
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.bottom,
        whiteSpace: 'normal',
        backgroundColor: theme.palette.maskColor.tips,
    },
}))

export interface EthereumERC20TokenApprovedBoundaryProps extends withClasses<'button' | 'container'> {
    amount: string
    spender?: string
    token?: FungibleToken<ChainId, SchemaType>
    fallback?: React.ReactNode
    children?: React.ReactNode | ((allowance: string) => React.ReactNode)
    infiniteUnlockContent?: React.ReactNode
    ActionButtonProps?: ActionButtonProps
    onlyInfiniteUnlock?: boolean
    contractName?: string
}

export function EthereumERC20TokenApprovedBoundary(props: EthereumERC20TokenApprovedBoundaryProps) {
    const { children = null, amount, spender, token, fallback, infiniteUnlockContent, contractName } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [{ type: approveStateType, allowance }, transactionState, approveCallback, resetApproveCallback] =
        useERC20TokenApproveCallback(token?.address ?? '', amount, spender ?? '')

    const onApprove = useCallback(async () => {
        if (approveStateType !== ApproveStateType.NOT_APPROVED) return
        await approveCallback(false)
    }, [approveStateType, transactionState, approveCallback])

    // not a valid erc20 token, please given token as undefined
    if (!token) return <>{typeof children === 'function' ? children(allowance) : children}</>

    if (approveStateType === ApproveStateType.UNKNOWN)
        return (
            <ActionButton
                className={classes.button}
                fullWidth
                variant="contained"
                disabled
                {...props.ActionButtonProps}>
                {fallback ?? t('wallet_transfer_error_amount_absence')}
            </ActionButton>
        )
    if (approveStateType === ApproveStateType.FAILED)
        return (
            <ActionButton
                className={classes.button}
                fullWidth
                variant="contained"
                onClick={resetApproveCallback}
                {...props.ActionButtonProps}>
                {t('wallet_load_retry', { symbol: token.symbol ?? token.name ?? 'Token' })}
            </ActionButton>
        )
    if (
        approveStateType === ApproveStateType.NOT_APPROVED ||
        transactionState.loading ||
        approveStateType === ApproveStateType.UPDATING
    )
        return (
            <ActionButton
                loading={transactionState.loading || approveStateType === ApproveStateType.UPDATING}
                className={classes.button}
                fullWidth
                variant="contained"
                startIcon={
                    <TokenIcon
                        address={token.address}
                        chainId={token.chainId}
                        name={token.name}
                        disableDefaultIcon
                        classes={{ icon: classes.icon }}
                    />
                }
                endIcon={
                    <Tooltip
                        classes={{
                            tooltip: classes.tooltip,
                        }}
                        PopperProps={{
                            disablePortal: true,
                        }}
                        title={t('plugin_wallet_token_infinite_unlock_tips', {
                            provider: contractName,
                            symbol: token.symbol,
                        })}
                        placement="top"
                        arrow
                        disableFocusListener
                        disableTouchListener>
                        <HelpOutline className={classes.helpIcon} />
                    </Tooltip>
                }
                onClick={onApprove}
                {...props.ActionButtonProps}>
                {infiniteUnlockContent ?? t('plugin_wallet_token_infinite_unlock', { symbol: token.symbol })}
            </ActionButton>
        )
    if (approveStateType === ApproveStateType.APPROVED)
        return <>{typeof children === 'function' ? children(allowance) : children}</>

    unreachable(approveStateType)
}
