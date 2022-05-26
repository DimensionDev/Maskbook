import React, { useCallback } from 'react'
import { Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    ApproveStateType,
    ERC20TokenDetailed,
    formatBalance,
    useERC20TokenApproveCallback,
} from '@masknet/web3-shared-evm'
import { unreachable } from '@dimensiondev/kit'
import { useI18N } from '../../utils'
import ActionButton, { ActionButtonProps } from '../../extension/options-page/DashboardComponents/ActionButton'
import { PluginWalletStatusBar } from '../../utils/components/PluginWalletStatusBar'

const useStyles = makeStyles()((theme) => ({
    button: {
        flexDirection: 'column',
        position: 'relative',
        marginTop: theme.spacing(1.5),
        lineHeight: '22px',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '13px 0',
        fontSize: 18,
    },
    buttonLabel: {
        display: 'block',
        fontWeight: 'inherit',
        marginTop: theme.spacing(-0.5),
        marginBottom: theme.spacing(1),
    },
    buttonAmount: {
        fontSize: 10,
        fontWeight: 300,
        bottom: theme.spacing(1),
        position: 'absolute',
    },
    children: {
        marginTop: 8,
        width: '100%',
    },
}))

export interface EthereumERC20TokenApprovedBoundaryProps {
    amount: string
    spender?: string
    token?: ERC20TokenDetailed
    fallback?: React.ReactNode
    children?: React.ReactNode | ((allowance: string) => React.ReactNode)
    render?: (disable: boolean) => React.ReactNode
    infiniteUnlockContent?: React.ReactNode
    ActionButtonProps?: ActionButtonProps
    onlyInfiniteUnlock?: boolean
    withChildren?: boolean
}

export function EthereumERC20TokenApprovedBoundary(props: EthereumERC20TokenApprovedBoundaryProps) {
    const {
        amount,
        spender,
        token,
        children = null,
        render,
        fallback,
        infiniteUnlockContent,
        onlyInfiniteUnlock = false,
        withChildren = false,
    } = props

    const { t } = useI18N()
    const { classes } = useStyles()

    const [{ type: approveStateType, allowance }, transactionState, approveCallback, resetApproveCallback] =
        useERC20TokenApproveCallback(token?.address ?? '', amount, spender)

    const onApprove = useCallback(
        async (useExact = false) => {
            if (approveStateType !== ApproveStateType.NOT_APPROVED) return
            await approveCallback(useExact)
        },
        [approveStateType, transactionState, approveCallback],
    )

    // not a valid erc20 token, please given token as undefined
    if (!token) return <>{render ? (render(false) as any) : children}</>

    if (approveStateType === ApproveStateType.UNKNOWN)
        return (
            <>
                <PluginWalletStatusBar
                    actionProps={{
                        disabled: true,
                        title: fallback ?? 'Enter an amount',
                    }}
                    classes={{ button: classes.button }}
                />
                {withChildren ? (
                    <Box className={classes.children}>{render ? (render(true) as any) : children}</Box>
                ) : null}
            </>
        )
    if (approveStateType === ApproveStateType.FAILED)
        return (
            <>
                <PluginWalletStatusBar
                    actionProps={{
                        title: t('wallet_load_retry', { symbol: token.symbol ?? token.name ?? 'Token' }),
                        action: resetApproveCallback,
                    }}
                    classes={{ button: classes.button }}
                />
                {withChildren ? (
                    <Box className={classes.children}>{render ? (render(true) as any) : children}</Box>
                ) : null}
            </>
        )
    if (approveStateType === ApproveStateType.NOT_APPROVED)
        return (
            <Box style={{ flex: 1, display: 'flex' }}>
                {!onlyInfiniteUnlock ? (
                    <>
                        <Box style={{ flex: 1, padding: 16 }}>
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={() => onApprove(true)}
                                {...props.ActionButtonProps}>
                                <span className={classes.buttonLabel}>{t('plugin_wallet_token_unlock')}</span>
                                <span className={classes.buttonAmount}>
                                    {formatBalance(amount, token.decimals, 2)} {token?.symbol ?? 'Token'}
                                </span>
                            </ActionButton>
                        </Box>
                        <Box style={{ flex: 1, padding: 16 }}>
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={() => onApprove(false)}
                                {...props.ActionButtonProps}>
                                {infiniteUnlockContent ?? t('plugin_wallet_token_infinite_unlock')}
                            </ActionButton>
                        </Box>
                    </>
                ) : null}
                {onlyInfiniteUnlock ? (
                    <PluginWalletStatusBar
                        actionProps={{
                            title: infiniteUnlockContent ?? t('plugin_wallet_token_infinite_unlock'),
                            action: () => onApprove(false),
                        }}
                        classes={{ button: classes.button }}
                    />
                ) : null}

                {withChildren ? (
                    <Box className={classes.children}>{render ? (render(true) as any) : children}</Box>
                ) : null}
            </Box>
        )
    if (approveStateType === ApproveStateType.PENDING || approveStateType === ApproveStateType.UPDATING)
        return (
            <PluginWalletStatusBar
                actionProps={{
                    title:
                        approveStateType === ApproveStateType.PENDING
                            ? t('plugin_ito_unlocking_symbol', { symbol: token.symbol })
                            : `Updating ${token.symbol}`,
                    action: resetApproveCallback,
                    disabled: true,
                    loading: approveStateType === ApproveStateType.PENDING,
                }}
                classes={{ button: classes.button }}
            />
        )
    if (approveStateType === ApproveStateType.APPROVED)
        return <>{render ? render(false) : typeof children === 'function' ? children(allowance) : children}</>

    unreachable(approveStateType)
}
