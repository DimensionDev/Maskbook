import { useCallback } from 'react'
import type { Contract } from 'web3-eth-contract'
import BigNumber from 'bignumber.js'
import { makeStyles, createStyles, Grid } from '@material-ui/core'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../types'
import { ApproveStateType, useERC20TokenApproveCallback } from '../hooks/useERC20TokenApproveCallback'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils/i18n-next-ui'
import { useAccount } from '../hooks/useAccount'
import { useChainIdValid } from '../hooks/useChainState'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { formatBalance } from '../../plugins/Wallet/formatter'

const useStyles = makeStyles((theme) => {
    return createStyles({
        button: {},
    })
})

export interface EthereumActionsBarProps extends withClasses<'button'> {
    approveToken: EtherTokenDetailed | ERC20TokenDetailed
    approveContract: Contract
    approveAmount: string
    children?: React.ReactNode
}

export function EthereumActionsBar(props: EthereumActionsBarProps) {
    const { approveToken, approveAmount, approveContract, children } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    //#region context
    const account = useAccount()
    const chainIdValid = useChainIdValid()
    //#endregion

    //#region approve
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        approveToken.address ?? '',
        approveAmount,
        approveContract.options.address,
    )
    const onApprove = useCallback(async () => {
        if (approveState.type !== ApproveStateType.NOT_APPROVED) return
        await approveCallback()
    }, [approveState])

    const onExactApprove = useCallback(async () => {
        if (approveState.type !== ApproveStateType.NOT_APPROVED) return
        await approveCallback(true)
    }, [approveState])
    //#endregion

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    const renderGrid = (content: React.ReactNode) => (
        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
            {content}
        </Grid>
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
                        {`Unlock ${formatBalance(new BigNumber(approveAmount), approveToken.decimals ?? 0, 2)} ${
                            approveToken.symbol ?? 'Token'
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

    if (approveState.type === ApproveStateType.PENDING)
        return renderGrid(
            <Grid item xs={12}>
                <ActionButton
                    className={classes.button}
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={approveState.type === ApproveStateType.PENDING}>
                    {`Unlocking ${approveToken.symbol ?? 'Token'}…`}
                </ActionButton>
            </Grid>,
        )

    if (!account || !chainIdValid)
        return renderGrid(
            <Grid item xs={12}>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" onClick={onConnect}>
                    {t('plugin_wallet_connect_a_wallet')}
                </ActionButton>
            </Grid>,
        )

    return renderGrid(children)
}
