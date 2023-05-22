import {
    ActionButtonPromise,
    EthereumERC20TokenApprovedBoundary,
    FormattedCurrency,
    FungibleTokenInput,
    InjectedDialog,
    PluginWalletStatusBar,
    TokenIcon,
    WalletConnectedBoundary,
    useOpenShareTxDialog,
} from '@masknet/shared'
import { NetworkPluginID, createLookupTableResolver } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import AaveLendingPoolAddressProviderABI from '@masknet/web3-contracts/abis/AaveLendingPoolAddressProvider.json'
import type { AaveLendingPoolAddressProvider } from '@masknet/web3-contracts/types/AaveLendingPoolAddressProvider.js'
import {
    useChainContext,
    useFungibleTokenBalance,
    useFungibleTokenPrice,
    useNativeToken,
    useWeb3,
    useWeb3Connection,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import {
    ZERO,
    formatBalance,
    formatCurrency,
    isLessThan,
    isLessThanOrEqualTo,
    isPositive,
    isZero,
    rightShift,
} from '@masknet/web3-shared-base'
import {
    SchemaType,
    chainResolver,
    createContract,
    getAaveConstant,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import { useMemo, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import type { AbiItem } from 'web3-utils'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base.js'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { useI18N } from '../../../utils/index.js'
import { ProtocolType, TabType, type SavingsProtocol } from '../types.js'
import { useApr, useBalance } from './hooks/index.js'

export const useStyles = makeStyles()((theme, props) => ({
    containerWrap: {
        padding: 0,
        fontFamily: theme.typography.fontFamily,
    },
    inputWrap: {
        position: 'relative',
        width: '100%',
        margin: theme.spacing(1.25, 0),
    },
    tokenValueUSD: {
        padding: '0 0 10px 0',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 0 15px 0',
    },
    infoRowLeft: {
        display: 'flex',
        alignItems: 'center',
    },
    infoRowRight: {
        fontWeight: 'bold',
    },
    rowImage: {
        width: '24px',
        height: '24px',
        margin: '0 5px 0 0',
    },
    button: { width: '100%' },
    connectWallet: {
        marginTop: 0,
    },
    gasFee: {
        padding: '0 0 0 5px',
        fontSize: 11,
        opacity: 0.5,
    },
}))

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
    const isDeposit = tab === TabType.Deposit

    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const web3Connection = useWeb3Connection()
    const [inputAmount, setInputAmount] = useState('')
    const [estimatedGas, setEstimatedGas] = useState<BigNumber.Value>(ZERO)
    const { value: nativeToken } = useNativeToken<'all'>(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })
    const { value: nativeTokenBalance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, nativeToken?.address, {
        chainId,
    })
    const { Others } = useWeb3State()

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
    const { data: apr = '0.00' } = useApr(protocol, true)
    const { data: balance = ZERO } = useBalance(protocol, true)
    const balanceAsBN = useMemo(
        () => (isDeposit ? new BigNumber(inputTokenBalance || '0') : balance),
        [isDeposit, balance, inputTokenBalance],
    )

    const balanceGasMinus = Others?.isNativeTokenAddress(protocol.bareToken.address)
        ? balanceAsBN.minus(estimatedGas)
        : balanceAsBN

    const needsSwap = protocol.type === ProtocolType.Lido && !isDeposit

    const { loading } = useAsync(async () => {
        if (!web3 || isLessThanOrEqualTo(tokenAmount, 0)) return
        try {
            setEstimatedGas(
                isDeposit
                    ? await protocol.depositEstimate(account, chainId, web3, tokenAmount)
                    : await protocol.withdrawEstimate(account, chainId, web3, tokenAmount),
            )
        } catch {
            // do nothing
            console.log('Failed to estimate gas')
        }
    }, [chainId, isDeposit, protocol, tokenAmount])
    // #endregion

    // #region form validation
    const validationMessage = useMemo(() => {
        if (needsSwap) return ''
        if (tokenAmount.isZero() || !inputAmount) return t('plugin_trader_error_amount_absence')
        if (isLessThan(tokenAmount, 0)) return t('plugin_trade_error_input_amount_less_minimum_amount')

        if (isLessThan(balanceGasMinus, tokenAmount)) {
            return t('plugin_trader_error_insufficient_balance', {
                symbol: isDeposit ? protocol.bareToken.symbol : protocol.stakeToken.symbol,
            })
        }

        return ''
    }, [inputAmount, tokenAmount, nativeTokenBalance, balanceGasMinus, isDeposit])

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
        const aavePoolAddress = getAaveConstant(chainId, 'AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS')

        const lPoolAddressProviderContract = createContract<AaveLendingPoolAddressProvider>(
            web3,
            aavePoolAddress,
            AaveLendingPoolAddressProviderABI as AbiItem[],
        )

        const poolAddress = await lPoolAddressProviderContract?.methods.getLendingPool().call()

        return {
            approveToken: token.schema === SchemaType.ERC20 ? token : undefined,
            approveAmount: new BigNumber(inputAmount).shiftedBy(token.decimals),
            approveAddress: poolAddress,
        }
    }, [protocol.bareToken, inputAmount, chainId])

    const openShareTxDialog = useOpenShareTxDialog()
    const shareText = t(isDeposit ? 'promote_savings' : 'promote_withdraw', {
        amount: inputAmount,
        symbol: protocol.bareToken.symbol,
        chain: chainResolver.chainName(chainId),
        account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
    })
    const queryClient = useQueryClient()
    const [, executor] = useAsyncFn(async () => {
        if (!web3) return
        const methodName = isDeposit ? 'deposit' : 'withdraw'
        if (chainId !== currentChainId) await web3Connection?.switchChain?.(chainId)
        const hash = await protocol[methodName](account, chainId, web3, tokenAmount)
        if (typeof hash !== 'string') {
            throw new Error('Failed to deposit token.')
        } else {
            queryClient.invalidateQueries(['savings', 'balance', chainId, protocol.bareToken.address, account])
        }
        openShareTxDialog({
            hash,
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })
    }, [isDeposit, protocol, account, chainId, web3, tokenAmount, openShareTxDialog, currentChainId])

    const buttonDom = useMemo(() => {
        return (
            <WalletConnectedBoundary
                expectedChainId={chainId}
                ActionButtonProps={{ color: 'primary', classes: { root: classes.button } }}
                classes={{ connectWallet: classes.connectWallet, button: classes.button }}>
                {isDeposit ? (
                    inputTokenBalance && !isZero(inputTokenBalance) ? (
                        <EthereumERC20TokenApprovedBoundary
                            amount={approvalData?.approveAmount.toFixed() ?? ''}
                            token={approvalData?.approveToken}
                            spender={approvalData?.approveAddress}>
                            <ActionButtonPromise
                                className={classes.button}
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
                    ) : (
                        <ActionButtonPromise
                            className={classes.button}
                            init={validationMessage || t('plugin_savings_deposit') + ' ' + protocol.bareToken.symbol}
                            waiting={t('plugin_savings_process_deposit')}
                            failed={t('failed')}
                            failedOnClick="use executor"
                            complete={t('done')}
                            disabled={validationMessage !== '' && !needsSwap}
                            noUpdateEffect
                            executor={executor}
                        />
                    )
                ) : (
                    <ActionButtonPromise
                        init={
                            needsSwap
                                ? t('plugin_savings_swap_token', { token: protocol.bareToken.symbol })
                                : validationMessage ||
                                  t('plugin_savings_withdraw_token', { token: protocol.stakeToken.symbol })
                        }
                        waiting={t('plugin_savings_process_withdraw')}
                        failed={t('failed')}
                        failedOnClick="use executor"
                        className={classes.button}
                        complete={t('done')}
                        disabled={validationMessage !== ''}
                        noUpdateEffect
                        executor={executor}
                    />
                )}
            </WalletConnectedBoundary>
        )
    }, [executor, validationMessage, needsSwap, protocol, isDeposit, approvalData, chainId, inputTokenBalance])
    return (
        <InjectedDialog
            title={isDeposit ? t('plugin_savings_deposit') : t('plugin_savings_withdraw')}
            open
            onClose={onClose}>
            <DialogContent className={classes.containerWrap}>
                <div style={{ padding: '0 15px' }}>
                    {needsSwap ? null : (
                        <>
                            <div className={classes.inputWrap}>
                                <FungibleTokenInput
                                    amount={inputAmount}
                                    maxAmount={balanceGasMinus.toString()}
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
                                    {isPositive(estimatedGas) ? (
                                        <span className={classes.gasFee}>+ {formatBalance(estimatedGas, 18)} ETH</span>
                                    ) : (
                                        <span />
                                    )}
                                </Typography>
                            )}
                        </>
                    )}

                    <div className={classes.infoRow}>
                        <Typography variant="body2" component="div" className={classes.infoRowLeft}>
                            <TokenIcon
                                className={classes.rowImage}
                                address={protocol.bareToken.address}
                                logoURL={protocol.bareToken.logoURL}
                                chainId={protocol.bareToken.chainId}
                                name={protocol.bareToken.name}
                            />
                            {protocol.bareToken.name} {t('plugin_savings_apr')}%
                        </Typography>
                        <Typography variant="body2" className={classes.infoRowRight}>
                            {apr}%
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
