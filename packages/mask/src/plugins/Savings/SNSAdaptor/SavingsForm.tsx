import BigNumber from 'bignumber.js'
import { TextField, Button } from '@mui/material'
import { useState, useMemo } from 'react'
import { EthereumTokenType, useFungibleTokenBalance, useWeb3, useAccount } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { useStyles } from './SavingsFormStyles'
import { IconURLS } from './IconURL'
import { SavingsProtocols } from './protocols'
import { isLessThan, rightShift } from '@masknet/web3-shared-base'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'

export interface SavingsFormProps {
    chainId: number
    selectedProtocol: number
    tab: 'deposit' | 'withdraw'
    onClose?: () => void
    onSwapDialogOpen?: () => void
}

export function SavingsForm({ chainId, selectedProtocol, tab, onClose, onSwapDialogOpen }: SavingsFormProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const protocol = SavingsProtocols[selectedProtocol]
    const targetChainId = 5 // change to `chainId` later

    const web3 = useWeb3(false, targetChainId)
    const account = useAccount()

    const [inputAmount, setInputAmount] = useState('' as string)

    const { value: nativeTokenBalance, loading: loadingNativeTokenBalance } = useFungibleTokenBalance(
        EthereumTokenType.Native,
        '',
        targetChainId,
    )

    //#region form controls
    const formattedBalance = Number.parseInt(nativeTokenBalance || '0', 16) / Math.pow(10, 18)
    const tokenAmount = rightShift(inputAmount || '0', 18)
    //#endregion

    //#region UI logic
    // validate form return a message if an error exists
    const validationMessage = useMemo(() => {
        if (tokenAmount.isZero()) return t('plugin_trader_error_amount_absence')
        if (isLessThan(inputAmount, 0)) return t('plugin_trade_error_input_amount_less_minimum_amount')
        if (
            new BigNumber(
                (tab === 'deposit' ? nativeTokenBalance : Number.parseFloat(protocol.balance) * Math.pow(10, 18)) ||
                    '0',
            ).isLessThan(tokenAmount)
        ) {
            return t('plugin_trader_error_insufficient_balance', {
                symbol: tab === 'deposit' ? protocol.base : protocol.pair,
            })
        }

        return ''
    }, [inputAmount, tokenAmount.toFixed(), formattedBalance])
    //#endregion

    const needsSwap = protocol.name === 'Lido' && tab === 'withdraw'

    return (
        <div className={classes.containerWrap}>
            <h3 className={classes.title}>
                <img src={IconURLS.lido} className={classes.titleImage} />
                {tab === 'deposit' ? 'Stake' : 'Withdraw'} {protocol.name}
            </h3>

            <p className={classes.inputLabel}>
                Balance:{' '}
                {tab === 'deposit'
                    ? formattedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
                    : protocol.balance}{' '}
                {tab === 'deposit' ? protocol.base : protocol.pair}
            </p>

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
                            setInputAmount(tab === 'deposit' ? formattedBalance.toString() : protocol.balance)
                        }>
                        Max
                    </Button>
                    <div className={classes.inputCurrency}>
                        <img src={IconURLS.eth} className={classes.inputImage} />
                        <p>{tab === 'deposit' ? protocol.base : protocol.pair}</p>
                    </div>
                </div>
            </div>

            <div className={classes.infoRow}>
                <div className={classes.infoRowLeft}>
                    <img src={IconURLS.eth} className={classes.rowImage} />
                    {protocol.pair} APY%
                </div>
                <div className={classes.infoRowRight}>{protocol.apr}%</div>
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
                    <ActionButton
                        fullWidth
                        variant="contained"
                        classes={{ root: classes.button, disabled: classes.disabledButton }}
                        color="primary"
                        disabled={validationMessage && !needsSwap ? true : false}
                        onClick={async () => {
                            if (tab === 'deposit') {
                                await protocol.deposit(account, targetChainId, web3, tokenAmount)
                                onClose?.()
                            } else {
                                if (needsSwap) {
                                    onClose?.()
                                    onSwapDialogOpen?.()
                                } else {
                                    await protocol.withdraw(account, targetChainId, web3, tokenAmount)
                                    onClose?.()
                                }
                            }
                        }}>
                        {needsSwap
                            ? 'Swap ' + protocol.pair
                            : validationMessage ||
                              (tab === 'deposit' ? 'Deposit ' + protocol.base : 'Withdraw ' + protocol.pair)}
                    </ActionButton>
                </EthereumWalletConnectedBoundary>
            </EthereumChainBoundary>
        </div>
    )
}
