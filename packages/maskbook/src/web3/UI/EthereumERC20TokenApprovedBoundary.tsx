import { createStyles, Grid, makeStyles } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useSnackbar } from 'notistack'
import React, { useCallback, useEffect } from 'react'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { formatBalance } from '../../plugins/Wallet/formatter'
import { useI18N } from '../../utils/i18n-next-ui'
import { unreachable } from '../../utils/utils'
import { ApproveStateType, useERC20TokenApproveCallback } from '../hooks/useERC20TokenApproveCallback'
import { TransactionStateType } from '../hooks/useTransactionState'
import type { ERC20TokenDetailed } from '../types'

const useStyles = makeStyles((theme) =>
    createStyles({
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
    }),
)

export interface EthereumERC20TokenApprovedBoundaryProps {
    amount: string
    spender: string
    token?: ERC20TokenDetailed
    children?: React.ReactNode | ((allowance: string) => React.ReactNode)
}

export function EthereumERC20TokenApprovedBoundary(props: EthereumERC20TokenApprovedBoundaryProps) {
    const { amount, spender, token, children = null } = props

    const { t } = useI18N()
    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()

    const [
        { type: approveStateType, allowance },
        transactionState,
        approveCallback,
        resetApproveCallback,
    ] = useERC20TokenApproveCallback(token?.address ?? '', amount, spender)

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
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" loading disabled />
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
                    Failed to load {token.symbol ?? token.name ?? 'Token'}.
                </ActionButton>
            </Grid>
        )
    if (approveStateType === ApproveStateType.INSUFFICIENT_BALANCE)
        return (
            <Grid container>
                <ActionButton
                    className={classes.button}
                    key="insufficent_balance"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled>
                    {`Insufficent ${token.symbol ?? token.name ?? 'Token'} Balance`}
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
                        <span className={classes.buttonAmount}>{`${formatBalance(
                            new BigNumber(amount),
                            token.decimals,
                            2,
                        )} ${token?.symbol ?? 'Token'}`}</span>
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
                    {`${approveStateType === ApproveStateType.PENDING ? 'Unlocking' : 'Updating'} ${
                        token.symbol ?? 'Token'
                    }…`}
                </ActionButton>
            </Grid>
        )
    if (approveStateType === ApproveStateType.APPROVED)
        return <Grid container>{typeof children === 'function' ? children(allowance) : children}</Grid>

    unreachable(approveStateType)
}
