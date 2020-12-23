import { createStyles, DialogContent, Grid, makeStyles, Slider, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback, useMemo, useState } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { EthereumTokenType } from '../../../web3/types'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { formatBalance } from '../../Wallet/formatter'
import { WalletMessages } from '../../Wallet/messages'
import { ITO_CONSTANTS } from '../constants'
import { PluginITO_Messages } from '../messages'
import type { JSON_PayloadInMask } from '../types'

const useStyles = makeStyles((theme) =>
    createStyles({
        section: {},
        slider: {},
        input: {},
        button: {},
    }),
)

export interface SwapDialogProps {}

export function SwapDialog(props: SwapDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const chainIdValid = useChainIdValid()

    const [tokenAmount, setTokenAmount] = useState('0')
    const [payload, setPayload] = useState<JSON_PayloadInMask | null>(null)

    //#region remote controlled dialog
    const [open, setOpen] = useRemoteControlledDialog(PluginITO_Messages.events.swapTokenUpdated, (ev) => {
        if (ev.open) {
            setPayload(ev.payload)
            return
        }
    })
    //#endregion

    //#region approve
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        payload?.token.type === EthereumTokenType.ERC20 ? payload.token.address : '',
        tokenAmount,
        ITO_CONTRACT_ADDRESS,
    )

    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState, approveCallback])
    const onExactApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback(true)
    }, [approveState, approveCallback])
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING
    //#endregion

    //#region claim
    const onSwap = useCallback(() => {}, [])
    //#endregion

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [])

    const tokenSymbol = payload?.token.symbol ?? 'Token'
    const { value: tokenBalance = '0' } = useTokenBalance(
        payload?.token.type ?? EthereumTokenType.Ether,
        payload?.token.address ?? '',
    )
    const validationMessage = useMemo(() => {
        return ''
    }, [])

    return (
        <InjectedDialog open={open} title={`Claim ${tokenSymbol}`} onClose={onClose}>
            <DialogContent>
                <section className={classes.section}>
                    <EthereumStatusBar />
                </section>
                <section className={classes.section}>
                    <Typography variant="body1">0 {tokenSymbol}</Typography>
                    <Slider className={classes.slider} />
                    <Typography variant="body1">{tokenSymbol}</Typography>
                </section>
                <section className={classes.section}>
                    <TokenAmountPanel
                        amount={tokenAmount}
                        balance={tokenBalance}
                        label="Swap"
                        onAmountChange={setTokenAmount}
                    />
                </section>
                <section className={classes.section}></section>
                <section className={classes.section}>
                    <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                        {approveRequired ? (
                            approveState === ApproveState.PENDING ? (
                                <Grid item xs={12}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={approveState === ApproveState.PENDING}>
                                        {`Unlocking ${payload?.token.symbol ?? 'Token'}…`}
                                    </ActionButton>
                                </Grid>
                            ) : (
                                <>
                                    <Grid item xs={6}>
                                        <ActionButton
                                            className={classes.button}
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={onExactApprove}>
                                            {approveState === ApproveState.NOT_APPROVED
                                                ? `Unlock ${formatBalance(
                                                      new BigNumber(tokenAmount),
                                                      payload?.token.decimals ?? 0,
                                                      2,
                                                  )} ${payload?.token.symbol ?? 'Token'}`
                                                : ''}
                                        </ActionButton>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ActionButton
                                            className={classes.button}
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={onApprove}>
                                            {approveState === ApproveState.NOT_APPROVED ? `Infinite Unlock` : ''}
                                        </ActionButton>
                                    </Grid>
                                </>
                            )
                        ) : (
                            <Grid item xs={12}>
                                {!account || !chainIdValid ? (
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={onConnect}>
                                        {t('plugin_wallet_connect_a_wallet')}
                                    </ActionButton>
                                ) : (
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={!!validationMessage || approveRequired}
                                        onClick={onSwap}>
                                        {validationMessage || t('plugin_trader_swap')}
                                    </ActionButton>
                                )}
                            </Grid>
                        )}
                    </Grid>
                </section>
            </DialogContent>
            {/* <SelectERC20TokenDialog /> */}
        </InjectedDialog>
    )
}
