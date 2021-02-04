import { createStyles, Grid, makeStyles } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect } from 'react'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { formatBalance } from '../../plugins/Wallet/formatter'
import { useI18N } from '../../utils/i18n-next-ui'
import { unreachable } from '../../utils/utils'
import { ApproveState, useERC20TokenApproveCallback } from '../hooks/useERC20TokenApproveCallbackV2'
import { TransactionStateType } from '../hooks/useTransactionState'
import type { ERC20TokenDetailed } from '../types'

const useStyles = makeStyles((theme) =>
    createStyles({
        button: {},
    }),
)

export interface EthereumIfERC20TokenApprovedProps {
    amount: string
    spender: string
    token?: ERC20TokenDetailed
    children?: React.ReactNode
}

export function EthereumIfERC20TokenApproved(props: EthereumIfERC20TokenApprovedProps) {
    const { amount, spender, token, children = null } = props

    const { t } = useI18N()
    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()

    const [approveState, transactionState, approveCallback, resetApproveCallback] = useERC20TokenApproveCallback(
        token?.address ?? '',
        amount,
        spender,
    )

    const onApprove = useCallback(
        async (useExact = false) => {
            if (approveState !== ApproveState.NOT_APPROVED) return
            await approveCallback(useExact)
        },
        [approveState, transactionState, approveCallback],
    )

    useEffect(() => {
        if (transactionState.type === TransactionStateType.FAILED)
            enqueueSnackbar(transactionState.error.message, { variant: 'error' })
    }, [transactionState.type, enqueueSnackbar])

    // not a valid erc20 token, please given token as undefined
    if (!token) return <Grid xs={12}>{children}</Grid>

    if (approveState === ApproveState.UNKNOWN)
        return (
            <Grid xs={12}>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" loading disabled />
            </Grid>
        )
    if (approveState === ApproveState.FAILED)
        return (
            <Grid xs={12}>
                <ActionButton
                    className={classes.button}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={resetApproveCallback}>
                    Failed to load {token.symbol ?? token.name ?? 'Token'}
                </ActionButton>
            </Grid>
        )
    if (approveState === ApproveState.INSUFFICIENT_BALANCE)
        return (
            <Grid xs={12}>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" disabled>
                    {`Insufficent ${token.symbol ?? token.name ?? 'Token'} Balance`}
                </ActionButton>
            </Grid>
        )
    if (approveState === ApproveState.NOT_APPROVED)
        return (
            <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                <Grid item xs={6}>
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => onApprove(true)}>
                        {t('plugin_wallet_token_unlock', {
                            balance: formatBalance(new BigNumber(amount), token.decimals, 2),
                            symbol: token?.symbol ?? 'Token',
                        })}
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
    if (approveState === ApproveState.PENDING || approveState === ApproveState.UPDATING)
        return (
            <Grid xs={12}>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" disabled>
                    {`${approveState === ApproveState.PENDING ? 'Unlocking' : 'Updating'} ${token.symbol ?? 'Token'}…`}
                </ActionButton>
            </Grid>
        )
    if (approveState === ApproveState.APPROVED) return <Grid xs={12}>{children}</Grid>

    unreachable(approveState)
}
