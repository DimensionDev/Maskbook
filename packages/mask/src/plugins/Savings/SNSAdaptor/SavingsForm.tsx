import { useState, useMemo } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { isLessThan, rightShift, ZERO, formatBalance, formatCurrency } from '@masknet/web3-shared-base'
import { LoadingBase } from '@masknet/theme'
import {
    createContract,
    createERC20Token,
    SchemaType,
    getAaveConstants,
    ZERO_ADDRESS,
    chainResolver,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import {
    useAccount,
    useFungibleTokenBalance,
    useFungibleTokenPrice,
    useNativeToken,
    useWeb3,
} from '@masknet/web3-hooks-base'
import { FungibleTokenInput, FormattedCurrency, InjectedDialog, TokenIcon, useOpenShareTxDialog } from '@masknet/shared'
import type { AaveLendingPoolAddressProvider } from '@masknet/web3-contracts/types/AaveLendingPoolAddressProvider'
import AaveLendingPoolAddressProviderABI from '@masknet/web3-contracts/abis/AaveLendingPoolAddressProvider.json'
import { PluginWalletStatusBar, useI18N } from '../../../utils/index.js'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary.js'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary.js'
import { ProtocolType, SavingsProtocol, TabType } from '../types.js'
import { useStyles } from './SavingsFormStyles.js'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary.js'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base.js'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton.js'
import { createLookupTableResolver, NetworkPluginID } from '@masknet/shared-base'

export interface SavingsFormDialogProps {
    chainId: number
    protocol: SavingsProtocol
    tab: TabType
    onClose?: () => void
}

export const resolveProtocolName = createLookupTableResolver<ProtocolType, string>(
    {
        [ProtocolType.Lido]: 'Lido',
        [ProtocolType.AAVE]: 'AAVE',
    },
    'unknown',
)

export function SavingsFormDialog({ chainId, protocol, tab, onClose }: SavingsFormDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const [inputAmount, setInputAmount] = useState('')
    const [estimatedGas, setEstimatedGas] = useState<BigNumber.Value>(ZERO)

    const { value: nativeToken } = useNativeToken<'all'>(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })
    const { value: nativeTokenBalance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, nativeToken?.address, {
        chainId,
    })

    // #region form variables
    const { value: inputTokenBalance } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        protocol.bareToken.address,
        { chainId },
    )
    const tokenAmount = useMemo(
        () => new BigNumber(rightShift(inputAmount || '0', protocol.bareToken.decimals)),
        [inputAmount, protocol.bareToken.decimals],
    )
    const balanceAsBN = useMemo(
        () => (tab === TabType.Deposit ? new BigNumber(inputTokenBalance || '0') : protocol.balance),
        [tab, protocol.balance, inputTokenBalance],
    )
    const needsSwap = protocol.type === ProtocolType.Lido && tab === TabType.Withdraw

    const { loading } = useAsync(async () => {
        if (!web3 || !(tokenAmount.toNumber() > 0)) return
        try {
            setEstimatedGas(
                tab === TabType.Deposit
                    ? await protocol.depositEstimate(account, chainId, web3, tokenAmount)
                    : await protocol.withdrawEstimate(account, chainId, web3, tokenAmount),
            )
        } catch {
            // do nothing
            console.log('Failed to estimate gas')
        }
    }, [chainId, tab, protocol, tokenAmount])
    // #endregion

    // #region form validation
    const validationMessage = useMemo(() => {
        if (needsSwap) return ''
        if (tokenAmount.isZero() || !inputAmount) return t('plugin_trader_error_amount_absence')
        if (isLessThan(tokenAmount, 0)) return t('plugin_trade_error_input_amount_less_minimum_amount')

        if (isLessThan(balanceAsBN.minus(estimatedGas), tokenAmount)) {
            return t('plugin_trader_error_insufficient_balance', {
                symbol: tab === TabType.Deposit ? protocol.bareToken.symbol : protocol.stakeToken.symbol,
            })
        }

        return ''
    }, [inputAmount, tokenAmount, nativeTokenBalance, balanceAsBN])

    const { value: tokenPrice = 0 } = useFungibleTokenPrice(
        NetworkPluginID.PLUGIN_EVM,
        !isNativeTokenAddress(protocol.bareToken.address) ? protocol.bareToken.address : nativeToken?.address,
        { chainId },
    )

    const tokenValueUSD = useMemo(
        () => (inputAmount ? new BigNumber(inputAmount).times(tokenPrice).toFixed(2) : '0'),
        [inputAmount, tokenPrice],
    )
    // #endregion

    const { value: approvalData } = useAsync(async () => {
        const token = protocol.bareToken
        const aavePoolAddress =
            getAaveConstants(chainId).AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS

        const lPoolAddressProviderContract = createContract<AaveLendingPoolAddressProvider>(
            web3,
            aavePoolAddress,
            AaveLendingPoolAddressProviderABI as AbiItem[],
        )

        const poolAddress = await lPoolAddressProviderContract?.methods.getLendingPool().call()

        return {
            approveToken:
                token.schema === SchemaType.ERC20
                    ? createERC20Token(chainId, token.address, token.name, token.symbol, token.decimals)
                    : undefined,
            approveAmount: new BigNumber(inputAmount).shiftedBy(token.decimals),
            approveAddress: poolAddress,
        }
    }, [protocol.bareToken, inputAmount, chainId])

    const openShareTxDialog = useOpenShareTxDialog()
    const shareText = t(tab === TabType.Deposit ? 'promote_savings' : 'promote_withdraw', {
        amount: inputAmount,
        symbol: protocol.bareToken.symbol,
        chain: chainResolver.chainName(chainId),
        account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
    })
    const [, executor] = useAsyncFn(async () => {
        if (!web3) return
        const methodName = tab === TabType.Deposit ? 'deposit' : 'withdraw'
        const hash = await protocol[methodName](account, chainId, web3, tokenAmount)
        if (typeof hash !== 'string') {
            throw new Error('Failed to deposit token.')
        } else {
            await protocol.updateBalance(chainId, web3, account)
        }
        openShareTxDialog({
            hash,
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })
    }, [tab, protocol, account, chainId, web3, tokenAmount, openShareTxDialog])

    const buttonDom = useMemo(() => {
        if (tab === TabType.Deposit)
            return (
                <ChainBoundary
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={chainId}
                    noSwitchNetworkTip
                    ActionButtonPromiseProps={{
                        fullWidth: true,
                        classes: { root: classes.button, disabled: classes.disabledButton },
                    }}>
                    <WalletConnectedBoundary
                        ActionButtonProps={{ color: 'primary', classes: { root: classes.button } }}
                        classes={{ connectWallet: classes.connectWallet, button: classes.button }}>
                        <EthereumERC20TokenApprovedBoundary
                            amount={approvalData?.approveAmount.toFixed() ?? ''}
                            token={approvalData?.approveToken}
                            spender={approvalData?.approveAddress}>
                            <ActionButtonPromise
                                fullWidth
                                color="primary"
                                init={
                                    validationMessage || t('plugin_savings_deposit') + ' ' + protocol.bareToken.symbol
                                }
                                waiting={t('plugin_savings_process_deposit')}
                                failed={t('failed')}
                                failedOnClick="use executor"
                                complete={t('done')}
                                disabled={validationMessage !== '' && !needsSwap}
                                noUpdateEffect
                                executor={executor}
                            />
                        </EthereumERC20TokenApprovedBoundary>
                    </WalletConnectedBoundary>
                </ChainBoundary>
            )

        return (
            <ChainBoundary
                expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                expectedChainId={chainId}
                noSwitchNetworkTip
                ActionButtonPromiseProps={{
                    fullWidth: true,
                    classes: { root: classes.button, disabled: classes.disabledButton },
                }}>
                <WalletConnectedBoundary
                    ActionButtonProps={{ classes: { root: classes.button } }}
                    classes={{ connectWallet: classes.connectWallet, button: classes.button }}>
                    <ActionButtonPromise
                        fullWidth
                        init={
                            needsSwap
                                ? 'Swap ' + protocol.bareToken.symbol
                                : validationMessage || t('plugin_savings_withdraw') + ' ' + protocol.stakeToken.symbol
                        }
                        waiting={t('plugin_savings_process_withdraw')}
                        failed={t('failed')}
                        failedOnClick="use executor"
                        complete={t('done')}
                        disabled={validationMessage !== ''}
                        noUpdateEffect
                        executor={executor}
                    />
                </WalletConnectedBoundary>
            </ChainBoundary>
        )
    }, [executor, validationMessage, needsSwap, protocol, tab, approvalData, chainId])

    return (
        <InjectedDialog title={t('plugin_savings')} open onClose={onClose}>
            <DialogContent className={classes.containerWrap}>
                <div style={{ padding: '0 15px' }}>
                    {needsSwap ? null : (
                        <>
                            <div className={classes.inputWrap}>
                                <FungibleTokenInput
                                    amount={inputAmount}
                                    maxAmount={balanceAsBN.minus(estimatedGas).toString()}
                                    balance={balanceAsBN.toString()}
                                    label={t('plugin_savings_amount')}
                                    token={protocol.bareToken}
                                    onAmountChange={setInputAmount}
                                />
                            </div>

                            {loading ? (
                                <Typography variant="body2" textAlign="right" className={classes.tokenValueUSD}>
                                    <LoadingBase width={16} height={16} />
                                </Typography>
                            ) : (
                                <Typography variant="body2" textAlign="right" className={classes.tokenValueUSD}>
                                    &asymp; <FormattedCurrency value={tokenValueUSD} formatter={formatCurrency} />
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
                            <TokenIcon
                                address={protocol.bareToken.address}
                                logoURL={protocol.bareToken.logoURL}
                                classes={{ icon: classes.rowImage }}
                                chainId={protocol.bareToken.chainId}
                                name={protocol.bareToken.name}
                            />
                            {protocol.bareToken.name} {t('plugin_savings_apr')}%
                        </Typography>
                        <Typography variant="body2" className={classes.infoRowRight}>
                            {protocol.apr}%
                        </Typography>
                    </div>
                </div>
            </DialogContent>
            <DialogActions style={{ padding: 0, position: 'sticky', bottom: 0 }}>
                <PluginWalletStatusBar>{buttonDom}</PluginWalletStatusBar>
            </DialogActions>
        </InjectedDialog>
    )
}
