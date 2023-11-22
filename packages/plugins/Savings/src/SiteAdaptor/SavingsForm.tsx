import { useMemo, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { useQueryClient } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import type { AbiItem } from 'web3-utils'
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
import { NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import AaveLendingPoolAddressProviderABI from '@masknet/web3-contracts/abis/AaveLendingPoolAddressProvider.json'
import type { AaveLendingPoolAddressProvider } from '@masknet/web3-contracts/types/AaveLendingPoolAddressProvider.js'
import {
    useChainContext,
    useFungibleTokenBalance,
    useFungibleTokenPrice,
    useNativeToken,
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
import { share } from '@masknet/plugin-infra/content-script/context'
import { EVMContract, EVMUtils, EVMWeb3, EVMChainResolver } from '@masknet/web3-providers'
import { SchemaType, getAaveConstant, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import { ProtocolType, TabType, type SavingsProtocol } from '../types.js'
import { useApr, useBalance } from './hooks/index.js'
import { useSavingsTrans } from '../locales/index.js'

const useStyles = makeStyles()((theme, props) => ({
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

interface SavingsFormDialogProps {
    chainId: number
    protocol: SavingsProtocol
    tab: TabType
    onClose?: () => void
}

export function SavingsFormDialog({ chainId, protocol, tab, onClose }: SavingsFormDialogProps) {
    const t = useSavingsTrans()
    const { classes } = useStyles()
    const isDeposit = tab === TabType.Deposit
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [inputAmount, setInputAmount] = useState('')
    const [estimatedGas, setEstimatedGas] = useState<BigNumber.Value>(ZERO)
    const { data: nativeToken } = useNativeToken<'all'>(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })
    const { data: nativeTokenBalance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, nativeToken?.address, {
        chainId,
    })

    // #region form variables
    const { data: inputTokenBalance } = useFungibleTokenBalance(
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

    const balanceGasMinus =
        EVMUtils.isNativeTokenAddress(protocol.bareToken.address) ? balanceAsBN.minus(estimatedGas) : balanceAsBN

    const needsSwap = protocol.type === ProtocolType.Lido && !isDeposit

    const { loading } = useAsync(async () => {
        if (isLessThanOrEqualTo(tokenAmount, 0)) return
        try {
            setEstimatedGas(
                isDeposit ?
                    await protocol.depositEstimate(account, chainId, EVMWeb3.getWeb3({ chainId }), tokenAmount)
                :   await protocol.withdrawEstimate(account, chainId, EVMWeb3.getWeb3({ chainId }), tokenAmount),
            )
        } catch {
            // do nothing
            console.error('Failed to estimate gas')
        }
    }, [chainId, isDeposit, protocol, tokenAmount])
    // #endregion

    // #region form validation
    const validationMessage = useMemo(() => {
        if (needsSwap) return ''
        if (tokenAmount.isZero() || !inputAmount) return t.plugin_trader_error_amount_absence()
        if (isLessThan(tokenAmount, 0)) return t.plugin_trade_error_input_amount_less_minimum_amount()
        if (isLessThan(balanceGasMinus, tokenAmount)) {
            return t.plugin_trader_error_insufficient_balance({
                symbol: isDeposit ? protocol.bareToken.symbol : protocol.stakeToken.symbol,
            })
        }
        return ''
    }, [inputAmount, tokenAmount, nativeTokenBalance, balanceGasMinus, isDeposit])

    const { data: tokenPrice = 0 } = useFungibleTokenPrice(
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
        const aavePoolAddress = getAaveConstant(chainId, 'AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS')
        if (!aavePoolAddress) return

        const lPoolAddressProviderContract = EVMContract.getWeb3Contract<AaveLendingPoolAddressProvider>(
            aavePoolAddress,
            AaveLendingPoolAddressProviderABI as AbiItem[],
        )

        const token = protocol.bareToken

        return {
            approveToken: token.schema === SchemaType.ERC20 ? token : undefined,
            approveAmount: new BigNumber(inputAmount).shiftedBy(token.decimals),
            approveAddress: await lPoolAddressProviderContract?.methods.getLendingPool().call(),
        }
    }, [chainId, protocol.bareToken, inputAmount])

    const openShareTxDialog = useOpenShareTxDialog()
    const promote = {
        amount: inputAmount,
        symbol: protocol.bareToken.symbol,
        chain: EVMChainResolver.chainName(chainId) ?? '',
        account: Sniffings.is_twitter_page ? t.twitter_account() : t.facebook_account(),
    }
    const shareText = isDeposit ? t.promote_savings(promote) : t.promote_withdraw(promote)
    const queryClient = useQueryClient()
    const [, executor] = useAsyncFn(async () => {
        const methodName = isDeposit ? 'deposit' : 'withdraw'
        if (chainId !== currentChainId) await EVMWeb3.switchChain?.(chainId)
        const hash = await protocol[methodName](account, chainId, EVMWeb3.getWeb3({ chainId }), tokenAmount)
        if (typeof hash !== 'string') {
            throw new Error('Failed to deposit token.')
        } else {
            queryClient.invalidateQueries({
                queryKey: ['savings', 'balance', chainId, protocol.bareToken.address, account],
            })
        }
        await openShareTxDialog({
            hash,
            onShare() {
                share?.(shareText)
            },
        })
    }, [isDeposit, protocol, account, chainId, tokenAmount, openShareTxDialog, currentChainId])

    const buttonDom = useMemo(() => {
        return (
            <WalletConnectedBoundary
                expectedChainId={chainId}
                ActionButtonProps={{ color: 'primary', classes: { root: classes.button } }}
                classes={{ connectWallet: classes.connectWallet, button: classes.button }}>
                {isDeposit ?
                    inputTokenBalance && !isZero(inputTokenBalance) ?
                        <EthereumERC20TokenApprovedBoundary
                            amount={approvalData?.approveAmount.toFixed() ?? ''}
                            token={approvalData?.approveToken}
                            spender={approvalData?.approveAddress}>
                            <ActionButtonPromise
                                className={classes.button}
                                init={validationMessage || t.plugin_savings_deposit() + ' ' + protocol.bareToken.symbol}
                                waiting={t.plugin_savings_process_deposit()}
                                failed={t.failed()}
                                failedOnClick="use executor"
                                complete={t.done()}
                                disabled={validationMessage !== '' && !needsSwap}
                                noUpdateEffect
                                executor={executor}
                            />
                        </EthereumERC20TokenApprovedBoundary>
                    :   <ActionButtonPromise
                            className={classes.button}
                            init={validationMessage || t.plugin_savings_deposit() + ' ' + protocol.bareToken.symbol}
                            waiting={t.plugin_savings_process_deposit()}
                            failed={t.failed()}
                            failedOnClick="use executor"
                            complete={t.done()}
                            disabled={validationMessage !== '' && !needsSwap}
                            noUpdateEffect
                            executor={executor}
                        />

                :   <ActionButtonPromise
                        init={
                            needsSwap ?
                                t.plugin_savings_swap_token({ token: protocol.bareToken.symbol })
                            :   validationMessage ||
                                t.plugin_savings_withdraw_token({ token: protocol.stakeToken.symbol })
                        }
                        waiting={t.plugin_savings_process_withdraw()}
                        failed={t.failed()}
                        failedOnClick="use executor"
                        className={classes.button}
                        complete={t.done()}
                        disabled={validationMessage !== ''}
                        noUpdateEffect
                        executor={executor}
                    />
                }
            </WalletConnectedBoundary>
        )
    }, [executor, validationMessage, needsSwap, protocol, isDeposit, approvalData, chainId, inputTokenBalance])
    return (
        <InjectedDialog
            title={isDeposit ? t.plugin_savings_deposit() : t.plugin_savings_withdraw()}
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
                                    label={t.plugin_savings_amount()}
                                    token={protocol.bareToken}
                                    onAmountChange={setInputAmount}
                                />
                            </div>

                            {loading ?
                                <Typography variant="body2" textAlign="right" className={classes.tokenValueUSD}>
                                    <LoadingBase width={16} height={16} />
                                </Typography>
                            :   <Typography variant="body2" textAlign="right" className={classes.tokenValueUSD}>
                                    &asymp; <FormattedCurrency value={tokenValueUSD} formatter={formatCurrency} />
                                    {isPositive(estimatedGas) ?
                                        <span className={classes.gasFee}>+ {formatBalance(estimatedGas, 18)} ETH</span>
                                    :   <span />}
                                </Typography>
                            }
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
                            {protocol.bareToken.name} {t.plugin_savings_apr()}%
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
