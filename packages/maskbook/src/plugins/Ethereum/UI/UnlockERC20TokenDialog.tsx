import { useCallback, useMemo, useState } from 'react'
import { makeStyles, createStyles, DialogContent, DialogActions, Grid, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../Wallet/messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { ApproveStateType, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import type { ERC20TokenDetailed } from '../../../web3/types'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { formatBalance, formatEthereumAddress } from '../../Wallet/formatter'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { EthereumMessages } from '../messages'

const useStyles = makeStyles((theme) =>
    createStyles({
        token: {
            marginBottom: theme.spacing(3),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        icon: {
            width: 48,
            height: 48,
        },
        tip: {
            marginTop: theme.spacing(1),
        },
        records: {
            flex: 1,
        },
        record: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: theme.spacing(4, 4, 2),
        },
    }),
)

export interface UnlockERC20TokenDialogProps {}

export function UnlockERC20TokenDialog(props: UnlockERC20TokenDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [token, setToken] = useState<ERC20TokenDetailed | null>(null)
    const [amount, setAmount] = useState('0')
    const [spender, setSpender] = useState('')

    const amount_ = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(token?.decimals ?? 0)).toFixed()

    //#region approve
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        token?.address ?? '',
        new BigNumber(amount).multipliedBy(new BigNumber(10).pow(token?.decimals ?? 0)).toFixed(),
        spender,
    )
    const onApprove = useCallback(async () => {
        if (approveState.type !== ApproveStateType.NOT_APPROVED) return
        await approveCallback()
    }, [approveState])

    const onExactApprove = useCallback(async () => {
        if (approveState.type !== ApproveStateType.NOT_APPROVED) return
        await approveCallback(true)
    }, [approveState.type])
    //#endregion

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(EthereumMessages.events.unlockERC20TokenDialogUpdated, (ev) => {
        if (ev.open) {
            setAmount(ev.amount)
            setToken(ev.token)
            setSpender(ev.spender)
        }
    })
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    const validationMessage = useMemo(() => {
        if (!amount || new BigNumber(amount_).isZero()) return 'Enter an amount'
        if (new BigNumber(approveState.allowance).gte(amount_)) return 'Approved'
        if (new BigNumber(approveState.balance).lt(amount_)) return 'Insufficent Balance'
        return ''
    }, [amount, approveState.allowance, approveState.balance, amount_])

    const renderGrid = (content: React.ReactNode) => (
        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
            {content}
        </Grid>
    )

    const renderButton = () => {
        if (validationMessage)
            return renderGrid(
                <Grid item xs={12}>
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled
                        onClick={onConnect}>
                        {validationMessage}
                    </ActionButton>
                </Grid>,
            )
        if (approveState.type === ApproveStateType.NOT_APPROVED)
            return renderGrid(
                <>
                    <Grid item xs={6}>
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={onExactApprove}>
                            {`Unlock ${formatBalance(new BigNumber(amount_), token?.decimals ?? 0, 2)} ${
                                token?.symbol ?? 'Token'
                            }`}
                        </ActionButton>
                    </Grid>
                    <Grid item xs={6}>
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={onApprove}>
                            {approveState.type === ApproveStateType.NOT_APPROVED ? `Infinite Unlock` : ''}
                        </ActionButton>
                    </Grid>
                </>,
            )
        if (approveState.type === ApproveStateType.PENDING || approveState.type === ApproveStateType.UPDATING)
            return renderGrid(
                <Grid item xs={12}>
                    <ActionButton className={classes.button} fullWidth variant="contained" size="large" disabled>
                        {`Unlocking ${token?.symbol ?? 'Token'}…`}
                    </ActionButton>
                </Grid>,
            )
        return null
    }

    if (!token) return null

    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            title={`Unlock ${token.symbol ?? 'Token'}`}
            DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent className={classes.content}>
                <TokenAmountPanel
                    token={token}
                    label={`Unlock ${token.symbol ?? 'Token'}`}
                    amount={amount}
                    balance={approveState.balance}
                    onAmountChange={setAmount}
                />
                <Typography className={classes.tip} variant="body2">
                    Allow <strong>{formatEthereumAddress(spender, 6)}</strong> to spend your {token.symbol ?? 'Token'}.
                </Typography>
            </DialogContent>
            <DialogActions>{renderButton()}</DialogActions>
        </InjectedDialog>
    )
}
