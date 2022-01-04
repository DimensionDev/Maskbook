import BigNumber from 'bignumber.js'
import { Typography } from '@mui/material'
import { useState, useMemo } from 'react'
import { useAsync } from 'react-use'
import { unreachable } from '@dimensiondev/kit'
import {
    EthereumTokenType,
    useNativeTokenDetailed,
    useFungibleTokenBalance,
    useWeb3,
    useAccount,
    formatCurrency,
} from '@masknet/web3-shared-evm'
import { TokenAmountPanel, FormattedCurrency } from '@masknet/shared'
import { useTokenPrice } from '../../Wallet/hooks/useTokenPrice'
import { useI18N } from '../../../utils'
import { useStyles } from './SavingsFormStyles'
import { IconURLS } from './IconURL'
import { TabType, ProtocolType } from '../types'
import { SavingsProtocols } from '../protocols'
import { isLessThan, rightShift } from '@masknet/web3-shared-base'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'

export interface SavingsFormProps {
    chainId: number
    selectedProtocol: ProtocolType
    tab: TabType
    onClose?: () => void
    onSwapDialogOpen?: () => void
}

export function SavingsForm({ chainId, selectedProtocol, tab, onClose, onSwapDialogOpen }: SavingsFormProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const protocol = SavingsProtocols[selectedProtocol]
    const targetChainId = chainId

    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    const web3 = useWeb3(false, targetChainId)
    const account = useAccount()

    const [inputAmount, setInputAmount] = useState('')
    const [estimatedGas, setEstimatedGas] = useState<BigNumber.Value>(new BigNumber('0'))

    const { value: nativeTokenBalance } = useFungibleTokenBalance(EthereumTokenType.Native, '', targetChainId)

    //#region form variables
    const tokenAmount = new BigNumber(rightShift(inputAmount || '0', 18))
    const inputAsBN = new BigNumber(rightShift(inputAmount, 18))
    const balanceAsBN = new BigNumber(TabType.Deposit ? nativeTokenBalance || '0' : protocol.balance)

    useAsync(async () => {
        const gasEstimate =
            tab === TabType.Deposit
                ? await protocol.depositEstimate(account, targetChainId, web3, new BigNumber('1'))
                : await protocol.withdrawEstimate(account, targetChainId, web3, new BigNumber('1'))
        setEstimatedGas(gasEstimate)
    }, [protocol, chainId])
    //#endregion

    //#region form validation
    const validationMessage = useMemo(() => {
        if (tokenAmount.isZero() || !inputAmount) return t('plugin_trader_error_amount_absence')
        if (isLessThan(inputAsBN, 0)) return t('plugin_trade_error_input_amount_less_minimum_amount')

        if (isLessThan(balanceAsBN.minus(estimatedGas), tokenAmount)) {
            return t('plugin_trader_error_insufficient_balance', {
                symbol: tab === TabType.Deposit ? protocol.base : protocol.pair,
            })
        }

        return ''
    }, [inputAmount, tokenAmount, nativeTokenBalance, protocol.balance])

    const tokenPrice = useTokenPrice(chainId, undefined)

    const tokenValueUSD = useMemo(
        () => (inputAmount ? new BigNumber(inputAmount).times(tokenPrice).toFixed(2).toString() : '0'),
        [inputAmount, tokenPrice],
    )
    //#endregion

    const needsSwap = protocol.type === ProtocolType.Lido && tab === TabType.Withdraw

    return (
        <div className={classes.containerWrap}>
            <div className={classes.inputWrap}>
                <TokenAmountPanel
                    amount={inputAmount}
                    maxAmount={balanceAsBN.minus(estimatedGas).toString()}
                    balance={balanceAsBN.toString()}
                    label={t('plugin_savings_amount')}
                    token={nativeTokenDetailed}
                    onAmountChange={setInputAmount}
                    InputProps={{ classes: { root: classes.inputTextField } }}
                    MaxChipProps={{ classes: { root: classes.maxChip } }}
                    SelectTokenChip={{ ChipProps: { classes: { root: classes.selectTokenChip } } }}
                />
            </div>

            <Typography variant="body2" textAlign="right" className={classes.tokenValueUSD}>
                ≈ <FormattedCurrency value={tokenValueUSD} sign="$" formatter={formatCurrency} />
            </Typography>

            <div className={classes.infoRow}>
                <Typography variant="body1" className={classes.infoRowLeft}>
                    <img src={IconURLS.eth} className={classes.rowImage} />
                    {protocol.pair} {t('plugin_savings_apy')}%
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
                                  (tab === TabType.Deposit
                                      ? t('plugin_savings_deposit') + ' ' + protocol.base
                                      : t('plugin_savings_withdraw') + ' ' + protocol.pair)
                        }
                        waiting={
                            TabType.Deposit ? t('plugin_savings_process_deposit') : t('plugin_savings_process_withdraw')
                        }
                        failed={t('failed')}
                        complete={t('done')}
                        disabled={validationMessage !== '' && !needsSwap}
                        executor={async () => {
                            switch (tab) {
                                case TabType.Deposit:
                                    await protocol.deposit(account, targetChainId, web3, tokenAmount)
                                    break
                                case TabType.Withdraw:
                                    switch (protocol.type) {
                                        case ProtocolType.Lido:
                                            onClose?.()
                                            onSwapDialogOpen?.()
                                            break
                                        default:
                                            await protocol.withdraw(account, targetChainId, web3, tokenAmount)
                                            break
                                    }
                                    break
                                default:
                                    unreachable(tab)
                            }
                        }}
                    />
                </EthereumWalletConnectedBoundary>
            </EthereumChainBoundary>
        </div>
    )
}
