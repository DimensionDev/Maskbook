import React, { useCallback } from 'react'
import { Grid, Box } from '@mui/material'
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

const useStyles = makeStyles()((theme) => ({
    button: {
        flexDirection: 'column',
        position: 'relative',
        marginTop: theme.spacing(1.5),
        lineHeight: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    if (!token) return <Grid container>{render ? render(false) : children}</Grid>

    if (approveStateType === ApproveStateType.UNKNOWN)
        return (
            <Grid container>
                <ActionButton
                    className={classes.button}
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled
                    {...props.ActionButtonProps}>
                    {fallback ?? 'Enter an amount'}
                </ActionButton>
                {withChildren ? <Box className={classes.children}>{render ? render(true) : children}</Box> : null}
            </Grid>
        )
    if (approveStateType === ApproveStateType.FAILED)
        return (
            <Grid container>
                <ActionButton
                    className={classes.button}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={resetApproveCallback}
                    {...props.ActionButtonProps}>
                    {t('wallet_load_retry', { symbol: token.symbol ?? token.name ?? 'Token' })}
                </ActionButton>
                {withChildren ? <Box className={classes.children}>{render ? render(true) : children}</Box> : null}
            </Grid>
        )
    if (approveStateType === ApproveStateType.NOT_APPROVED)
        return (
            <Box width="100%">
                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                    {!onlyInfiniteUnlock ? (
                        <Grid item xs={6}>
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={() => onApprove(true)}
                                {...props.ActionButtonProps}>
                                <span className={classes.buttonLabel}>{t('plugin_wallet_token_unlock')}</span>
                                <span className={classes.buttonAmount}>{`${formatBalance(amount, token.decimals, 2)} ${
                                    token?.symbol ?? 'Token'
                                }`}</span>
                            </ActionButton>
                        </Grid>
                    ) : null}
                    <Grid item xs={onlyInfiniteUnlock ? 12 : 6}>
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={() => onApprove(false)}
                            {...props.ActionButtonProps}>
                            {infiniteUnlockContent ?? t('plugin_wallet_token_infinite_unlock')}
                        </ActionButton>
                    </Grid>
                </Grid>
                {withChildren ? <Box className={classes.children}>{render ? render(true) : children}</Box> : null}
            </Box>
        )
    if (approveStateType === ApproveStateType.PENDING || approveStateType === ApproveStateType.UPDATING)
        return (
            <Grid container>
                <ActionButton
                    className={classes.button}
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled
                    {...props.ActionButtonProps}>
                    {approveStateType === ApproveStateType.PENDING
                        ? t('plugin_ito_unlocking_symbol', { symbol: token.symbol })
                        : `Updating ${token.symbol}`}
                    …
                </ActionButton>
            </Grid>
        )
    if (approveStateType === ApproveStateType.APPROVED)
        return (
            <Grid container>
                {render ? render(false) : typeof children === 'function' ? children(allowance) : children}
            </Grid>
        )

    unreachable(approveStateType)
}
