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
import AaveLendingPoolAddressProviderABI from '@masknet/web3-contracts/abis/AaveLendingPoolAddressProvider.json' with { type: 'json' }
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
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    const { _ } = useLingui()
    const { classes } = useStyles()
    const isDeposit = tab === TabType.Deposit
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [inputAmount, setInputAmount] = useState('')
    const [estimatedGas, setEstimatedGas] = useState<BigNumber.Value>(ZERO)
    const { data: nativeToken } = useNativeToken<'all'>(NetworkPluginID.PLUGIN_EVM, {
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
    const validationMessage = (() => {
        if (needsSwap) return undefined
        if (tokenAmount.isZero() || !inputAmount) return <Trans>Enter an amount</Trans>
        if (isLessThan(tokenAmount, 0)) return <Trans>Input amount is below the minimum amount</Trans>
        if (isLessThan(balanceGasMinus, tokenAmount)) {
            return (
                <Trans>
                    Insufficient ${isDeposit ? protocol.bareToken.symbol : protocol.stakeToken.symbol} balance
                </Trans>
            )
        }
        return ''
    })()

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
        account: Sniffings.is_twitter_page ? 'realMaskNetwork' : 'masknetwork',
    }
    const shareText =
        isDeposit ?
            _(
                msg`Hi friends, I just deposit ${promote.amount} ${promote.symbol} on ${promote.chain}. Follow @${promote.account} to find more staking projects.`,
            )
        :   _(
                msg`Hi friends, I just withdrew my deposit ${promote.amount} ${promote.symbol} on ${promote.chain}. Follow @${promote.account} to find more staking projects.`,
            )
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
                                init={validationMessage || _(msg`Deposit ${protocol.bareToken.symbol}`)}
                                waiting={<Trans>Processing Deposit</Trans>}
                                failed={<Trans>Failed</Trans>}
                                failedOnClick="use executor"
                                complete={<Trans>Done</Trans>}
                                disabled={validationMessage !== '' && !needsSwap}
                                noUpdateEffect
                                executor={executor}
                            />
                        </EthereumERC20TokenApprovedBoundary>
                    :   <ActionButtonPromise
                            className={classes.button}
                            init={validationMessage || _(msg`Deposit ${protocol.bareToken.symbol}`)}
                            waiting={<Trans>Processing Deposit</Trans>}
                            failed={<Trans>Failed</Trans>}
                            failedOnClick="use executor"
                            complete={<Trans>Done</Trans>}
                            disabled={validationMessage !== '' && !needsSwap}
                            noUpdateEffect
                            executor={executor}
                        />

                :   <ActionButtonPromise
                        init={
                            needsSwap ?
                                <Trans>Swap {protocol.bareToken.symbol}</Trans>
                            :   validationMessage || <Trans>Withdraw {protocol.stakeToken.symbol}</Trans>
                        }
                        waiting={<Trans>Processing Withdrawal</Trans>}
                        failed={<Trans>Failed</Trans>}
                        failedOnClick="use executor"
                        className={classes.button}
                        complete={<Trans>Done</Trans>}
                        disabled={validationMessage !== ''}
                        noUpdateEffect
                        executor={executor}
                    />
                }
            </WalletConnectedBoundary>
        )
    }, [executor, validationMessage, needsSwap, protocol, isDeposit, approvalData, chainId, inputTokenBalance])
    return (
        <InjectedDialog title={isDeposit ? <Trans>Deposit</Trans> : <Trans>Withdraw</Trans>} open onClose={onClose}>
            <DialogContent className={classes.containerWrap}>
                <div style={{ padding: '0 15px' }}>
                    {needsSwap ? null : (
                        <>
                            <div className={classes.inputWrap}>
                                <FungibleTokenInput
                                    amount={inputAmount}
                                    maxAmount={balanceGasMinus.toString()}
                                    balance={balanceAsBN.toString()}
                                    label={_(msg`Amount`)}
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
                            {protocol.bareToken.name} <Trans>APR</Trans>%
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
