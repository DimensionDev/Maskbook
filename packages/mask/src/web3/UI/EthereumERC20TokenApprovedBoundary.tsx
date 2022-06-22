import React, { useCallback } from 'react'
import { Grid, Box, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { unreachable } from '@dimensiondev/kit'
import { PluginWalletStatusBar, useI18N } from '../../utils'
import ActionButton, { ActionButtonProps } from '../../extension/options-page/DashboardComponents/ActionButton'
import { FungibleToken, formatBalance } from '@masknet/web3-shared-base'
import { ApproveStateType, useERC20TokenApproveCallback } from '@masknet/plugin-infra/web3-evm'

const useStyles = makeStyles()((theme) => ({
    button: {
        flexDirection: 'column',
        position: 'relative',
        lineHeight: '18px',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 18,
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
}))

export interface EthereumERC20TokenApprovedBoundaryProps extends withClasses<'button'> {
    amount: string
    spender?: string
    token?: FungibleToken<ChainId, SchemaType>
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
    const classes = useStylesExtends(useStyles(), props)

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
    if (!token) return <Grid container>{render ? (render(false) as any) : children}</Grid>

    if (transactionState.loading || approveStateType === ApproveStateType.UPDATING)
        return (
            <>
                <PluginWalletStatusBar
                    actionProps={{
                        disabled: true,
                        title: (
                            <Typography>
                                {transactionState.loading
                                    ? t('plugin_ito_unlocking_symbol', { symbol: token.symbol })
                                    : `Updating ${token.symbol}`}
                                &hellip;
                            </Typography>
                        ),
                    }}
                />
                {withChildren ? (
                    <Box className={classes.children}>{render ? (render(true) as any) : children}</Box>
                ) : null}
            </>
        )

    if (approveStateType === ApproveStateType.UNKNOWN)
        return (
            <>
                <PluginWalletStatusBar
                    actionProps={{
                        disabled: true,
                        title: fallback || 'Enter an amount',
                    }}
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
                        action: async () => resetApproveCallback(),
                    }}
                />
                {withChildren ? (
                    <Box className={classes.children}>{render ? (render(true) as any) : children}</Box>
                ) : null}
            </>
        )
    if (approveStateType === ApproveStateType.NOT_APPROVED)
        return (
            <Box style={{ display: 'flex', flex: 1 }}>
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
                ) : (
                    <PluginWalletStatusBar
                        actionProps={{
                            title: infiniteUnlockContent ?? t('plugin_wallet_token_infinite_unlock'),
                            action: async () => onApprove(true),
                        }}
                    />
                )}
                {withChildren ? (
                    <Box className={classes.children}>{render ? (render(true) as any) : children}</Box>
                ) : null}
            </Box>
        )
    if (approveStateType === ApproveStateType.APPROVED)
        return <>{render ? render(false) : typeof children === 'function' ? children(allowance) : children}</>

    unreachable(approveStateType)
}
