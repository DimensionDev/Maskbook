import BigNumber from 'bignumber.js'
import { Typography } from '@mui/material'
import { useState, useMemo, useCallback } from 'react'
import { useAsync } from 'react-use'
import { unreachable } from '@dimensiondev/kit'
import { isLessThan, rightShift } from '@masknet/web3-shared-base'
import {
    EthereumTokenType,
    useNativeTokenDetailed,
    useFungibleTokenBalance,
    useWeb3,
    useAccount,
    formatCurrency,
    formatBalance,
} from '@masknet/web3-shared-evm'
import {
    TokenAmountPanel,
    FormattedCurrency,
    LoadingAnimation,
    TokenIcon,
    useRemoteControlledDialog,
} from '@masknet/shared'
import { useTokenPrice } from '../../Wallet/hooks/useTokenPrice'
import { useI18N } from '../../../utils'
import { useStyles } from './SavingsFormStyles'
import { TabType, ProtocolType, SavingsProtocol } from '../types'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { PluginTraderMessages } from '../../Trader/messages'
import type { Coin } from '../../Trader/types'

export interface SavingsFormProps {
    chainId: number
    protocol: SavingsProtocol
    tab: TabType
    onClose?: () => void
}

export function SavingsForm({ chainId, protocol, tab, onClose }: SavingsFormProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    const web3 = useWeb3({ chainId })
    const account = useAccount()

    const [inputAmount, setInputAmount] = useState('')
    const [estimatedGas, setEstimatedGas] = useState<BigNumber.Value>(new BigNumber('0'))
    const [loading, setLoading] = useState(false)

    const { value: nativeTokenBalance } = useFungibleTokenBalance(EthereumTokenType.Native, '', chainId)

    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

    const onConvertClick = useCallback(() => {
        const token = protocol.stakeToken
        openSwapDialog({
            open: true,
            traderProps: {
                defaultInputCoin: {
                    id: token.address,
                    name: token.name ?? '',
                    symbol: token.symbol ?? '',
                    contract_address: token.address,
                    decimals: token.decimals,
                } as Coin,
            },
        })
    }, [protocol, openSwapDialog])

    // #region form variables
    const tokenAmount = useMemo(() => new BigNumber(rightShift(inputAmount || '0', 18)), [inputAmount])
    const inputAsBN = useMemo(() => new BigNumber(rightShift(inputAmount, 18)), [inputAmount])
    const balanceAsBN = useMemo(
        () => (TabType.Deposit ? new BigNumber(nativeTokenBalance || '0') : protocol.balance),
        [nativeTokenBalance, protocol.balance],
    )

    useAsync(async () => {
        if (!(inputAsBN.toNumber() > 0)) return
        try {
            setLoading(true)
            setEstimatedGas(
                tab === TabType.Deposit
                    ? await protocol.depositEstimate(account, chainId, web3, inputAsBN)
                    : await protocol.withdrawEstimate(account, chainId, web3, inputAsBN),
            )
        } catch {
            // do nothing
        } finally {
            setLoading(false)
        }
    }, [chainId, tab, protocol, inputAsBN])
    // #endregion

    // #region form validation
    const validationMessage = useMemo(() => {
        if (tokenAmount.isZero() || !inputAmount) return t('plugin_trader_error_amount_absence')
        if (isLessThan(inputAsBN, 0)) return t('plugin_trade_error_input_amount_less_minimum_amount')

        if (isLessThan(balanceAsBN.minus(estimatedGas), tokenAmount)) {
            return t('plugin_trader_error_insufficient_balance', {
                symbol: tab === TabType.Deposit ? protocol.bareToken.symbol : protocol.stakeToken.symbol,
            })
        }

        return ''
    }, [inputAmount, tokenAmount, nativeTokenBalance, balanceAsBN])

    const tokenPrice = useTokenPrice(chainId, undefined)

    const tokenValueUSD = useMemo(
        () => (inputAmount ? new BigNumber(inputAmount).times(tokenPrice).toFixed(2) : '0'),
        [inputAmount, tokenPrice],
    )
    // #endregion

    const needsSwap = protocol.type === ProtocolType.Lido && tab === TabType.Withdraw

    return (
        <div className={classes.containerWrap}>
            {needsSwap ? null : (
                <>
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

                    {loading ? (
                        <Typography variant="body2" textAlign="right" className={classes.tokenValueUSD}>
                            <LoadingAnimation width={16} height={16} />
                        </Typography>
                    ) : (
                        <Typography variant="body2" textAlign="right" className={classes.tokenValueUSD}>
                            &asymp; <FormattedCurrency value={tokenValueUSD} sign="$" formatter={formatCurrency} />
                            {estimatedGas > 0 ? (
                                <span className={classes.gasFee}>+ {formatBalance(estimatedGas, 18)} ETH</span>
                            ) : (
                                <span />
                            )}
                        </Typography>
                    )}
                </>
            )}

            <div className={classes.infoRow}>
                <Typography variant="body2" className={classes.infoRowLeft}>
                    <TokenIcon address={protocol.bareToken.address} classes={{ icon: classes.rowImage }} />
                    {protocol.bareToken.name} {t('plugin_savings_apr')}%
                </Typography>
                <Typography variant="body2" className={classes.infoRowRight}>
                    {protocol.apr}%
                </Typography>
            </div>

            <EthereumChainBoundary
                chainId={chainId}
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
                                ? 'Swap ' + protocol.bareToken.symbol
                                : validationMessage ||
                                  (tab === TabType.Deposit
                                      ? t('plugin_savings_deposit') + ' ' + protocol.bareToken.symbol
                                      : t('plugin_savings_withdraw') + ' ' + protocol.stakeToken.symbol)
                        }
                        waiting={
                            TabType.Deposit ? t('plugin_savings_process_deposit') : t('plugin_savings_process_withdraw')
                        }
                        failed={t('failed')}
                        failedOnClick="use executor"
                        complete={t('done')}
                        disabled={validationMessage !== '' && !needsSwap}
                        noUpdateEffect
                        executor={async () => {
                            switch (tab) {
                                case TabType.Deposit:
                                    if (!(await protocol.deposit(account, chainId, web3, tokenAmount))) {
                                        throw new Error('Failed to deposit token.')
                                    }
                                    return
                                case TabType.Withdraw:
                                    switch (protocol.type) {
                                        case ProtocolType.Lido:
                                            onClose?.()
                                            onConvertClick()
                                            return
                                        default:
                                            if (!(await protocol.withdraw(account, chainId, web3, tokenAmount))) {
                                                throw new Error('Failed to withdraw token.')
                                            }
                                            return
                                    }
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
