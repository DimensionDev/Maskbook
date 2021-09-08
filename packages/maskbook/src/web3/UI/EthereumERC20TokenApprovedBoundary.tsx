import React, { useCallback, useEffect } from 'react'
import { useSnackbar } from '@masknet/theme'
import { Grid } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import {
    ApproveStateType,
    ERC20TokenDetailed,
    formatBalance,
    TransactionStateType,
    useERC20TokenApproveCallback,
} from '@masknet/web3-shared'
import { unreachable } from '@dimensiondev/kit'
import { useI18N } from '../../utils'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => ({
    button: {
        flexDirection: 'column',
        position: 'relative',
        marginTop: theme.spacing(1.5),
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
}))

export interface EthereumERC20TokenApprovedBoundaryProps {
    amount: string
    spender?: string
    token?: ERC20TokenDetailed
    fallback?: React.ReactNode
    children?: React.ReactNode | ((allowance: string) => React.ReactNode)
}

export function EthereumERC20TokenApprovedBoundary(props: EthereumERC20TokenApprovedBoundaryProps) {
    const { amount, spender, token, children = null, fallback } = props

    const { t } = useI18N()
    const { classes } = useStyles()
    const { enqueueSnackbar } = useSnackbar()

    const [{ type: approveStateType, allowance }, transactionState, approveCallback, resetApproveCallback] =
        useERC20TokenApproveCallback(token?.address ?? '', amount, spender)

    const onApprove = useCallback(
        async (useExact = false) => {
            if (approveStateType !== ApproveStateType.NOT_APPROVED) return
            await approveCallback(useExact)
        },
        [approveStateType, transactionState, approveCallback],
    )

    useEffect(() => {
        if (transactionState.type === TransactionStateType.FAILED)
            enqueueSnackbar(transactionState.error.message, { variant: 'error' })
    }, [transactionState.type, enqueueSnackbar])

    // not a valid erc20 token, please given token as undefined
    if (!token) return <Grid container>{children}</Grid>

    if (approveStateType === ApproveStateType.UNKNOWN)
        return (
            <Grid container>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" disabled>
                    {fallback ?? 'Enter an amount'}
                </ActionButton>
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
                    onClick={resetApproveCallback}>
                    Failed to load {token.symbol ?? token.name ?? 'Token'}. Click to retry.
                </ActionButton>
            </Grid>
        )
    if (approveStateType === ApproveStateType.NOT_APPROVED)
        return (
            <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                <Grid item xs={6}>
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => onApprove(true)}>
                        <span className={classes.buttonLabel}>{t('plugin_wallet_token_unlock')}</span>
                        <span className={classes.buttonAmount}>{`${formatBalance(amount, token.decimals, 2)} ${
                            token?.symbol ?? 'Token'
                        }`}</span>
                    </ActionButton>
                </Grid>
                <Grid item xs={6}>
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => onApprove(false)}>
                        {t('plugin_wallet_token_infinite_unlock')}
                    </ActionButton>
                </Grid>
            </Grid>
        )
    if (approveStateType === ApproveStateType.PENDING || approveStateType === ApproveStateType.UPDATING)
        return (
            <Grid container>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" disabled>
                    {approveStateType === ApproveStateType.PENDING
                        ? t('plugin_ito_unlocking_symbol', { symbol: token.symbol })
                        : `Updating ${token.symbol}`}
                    …
                </ActionButton>
            </Grid>
        )
    if (approveStateType === ApproveStateType.APPROVED)
        return <Grid container>{typeof children === 'function' ? children(allowance) : children}</Grid>

    unreachable(approveStateType)
}
