import { TextField, Button, Typography } from '@mui/material'
import { useState, useMemo } from 'react'
import { EthereumTokenType, useFungibleTokenBalance, useWeb3, useAccount } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { useStyles } from './SavingsFormStyles'
import { IconURLS } from './IconURL'
import { TabType } from '../types'
import { SavingsProtocols } from '../protocols'
import { isLessThan, leftShift, rightShift } from '@masknet/web3-shared-base'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'

export interface SavingsFormProps {
    chainId: number
    selectedProtocol: number
    tab: TabType
    onClose?: () => void
    onSwapDialogOpen?: () => void
}

export function SavingsForm({ chainId, selectedProtocol, tab, onClose, onSwapDialogOpen }: SavingsFormProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const protocol = SavingsProtocols[selectedProtocol]
    const targetChainId = chainId

    const web3 = useWeb3(false, targetChainId)
    const account = useAccount()

    const [inputAmount, setInputAmount] = useState('')

    const { value: nativeTokenBalance, loading: loadingNativeTokenBalance } = useFungibleTokenBalance(
        EthereumTokenType.Native,
        '',
        targetChainId,
    )

    //#region form controls
    const formattedBalance = leftShift(Number.parseInt(nativeTokenBalance || '0', 16), 18)
    const tokenAmount = rightShift(inputAmount || '0', 18)
    //#endregion

    //#region UI logic
    // validate form return a message if an error exists
    const validationMessage = useMemo(() => {
        if (tokenAmount.isZero()) return t('plugin_trader_error_amount_absence')
        if (isLessThan(inputAmount, 0)) return t('plugin_trade_error_input_amount_less_minimum_amount')

        const tokenBalance =
            (tab === TabType.Deposit
                ? nativeTokenBalance
                : rightShift(protocol.balance, 18).integerValue().toFixed()) || '0'

        if (isLessThan(tokenBalance, tokenAmount)) {
            return t('plugin_trader_error_insufficient_balance', {
                symbol: tab === TabType.Deposit ? protocol.base : protocol.pair,
            })
        }

        return ''
    }, [inputAmount, tokenAmount.toFixed(), formattedBalance])
    //#endregion

    const needsSwap = protocol.name === 'Lido' && tab === 'withdraw'

    return (
        <div className={classes.containerWrap}>
            <Typography variant="h3" className={classes.title}>
                <img src={IconURLS.lido} className={classes.titleImage} />
                {tab === TabType.Deposit ? 'Stake' : 'Withdraw'} {protocol.name}
            </Typography>

            <Typography variant="body1" className={classes.inputLabel}>
                Balance:{' '}
                {tab === TabType.Deposit
                    ? formattedBalance
                          .toNumber()
                          .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
                    : protocol.balance}{' '}
                {tab === TabType.Deposit ? protocol.base : protocol.pair}
            </Typography>

            <div className={classes.inputWrap}>
                <TextField
                    type="text"
                    placeholder="0.00"
                    size="medium"
                    className={classes.input}
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                />
                <div className={classes.inputBalance}>
                    <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        className={classes.inputButton}
                        onClick={(e) =>
                            setInputAmount(tab === TabType.Deposit ? formattedBalance.toString() : protocol.balance)
                        }>
                        Max
                    </Button>
                    <div className={classes.inputCurrency}>
                        <img src={IconURLS.eth} className={classes.inputImage} />
                        <p>{tab === TabType.Deposit ? protocol.base : protocol.pair}</p>
                    </div>
                </div>
            </div>

            <div className={classes.infoRow}>
                <Typography variant="body1" className={classes.infoRowLeft}>
                    <img src={IconURLS.eth} className={classes.rowImage} />
                    {protocol.pair} APY%
                </Typography>
                <Typography variant="body1" className={classes.infoRowRight}>
                    {protocol.apr}%
                </Typography>
            </div>
            <EthereumChainBoundary
                chainId={targetChainId}
                noSwitchNetworkTip
                disablePadding
                ActionButtonPromiseProps={{
                    fullWidth: true,
                    classes: { root: classes.button, disabled: classes.disabledButton },
                    color: 'primary',
                    style: { padding: '13px 0', marginTop: 0 },
                }}>
                <EthereumWalletConnectedBoundary
                    ActionButtonProps={{ color: 'primary', classes: { root: classes.button } }}
                    classes={{ connectWallet: classes.connectWallet, button: classes.button }}>
                    <ActionButtonPromise
                        fullWidth
                        color="primary"
                        size="large"
                        variant="contained"
                        init={
                            needsSwap
                                ? 'Swap ' + protocol.pair
                                : validationMessage ||
                                  (tab === TabType.Deposit ? 'Deposit ' + protocol.base : 'Withdraw ' + protocol.pair)
                        }
                        waiting={TabType.Deposit ? 'Processing Deposit' : 'Processing Withdrawal'}
                        failed={t('failed')}
                        complete={t('done')}
                        disabled={validationMessage !== '' && !needsSwap}
                        executor={async () => {
                            if (tab === TabType.Deposit) {
                                await protocol.deposit(account, targetChainId, web3, tokenAmount)
                            } else {
                                if (needsSwap) {
                                    onClose?.()
                                    onSwapDialogOpen?.()
                                } else {
                                    await protocol.withdraw(account, targetChainId, web3, tokenAmount)
                                }
                            }
                        }}
                    />
                </EthereumWalletConnectedBoundary>
            </EthereumChainBoundary>
        </div>
    )
}
