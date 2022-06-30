import { forwardRef, useCallback, useEffect, useImperativeHandle, useState, useMemo } from 'react'
import { useUnmount, useUpdateEffect } from 'react-use'
import { delay } from '@dimensiondev/kit'
import { useOpenShareTxDialog, useSelectFungibleToken } from '@masknet/shared'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { NetworkPluginID, isSameAddress, FungibleToken, formatBalance } from '@masknet/web3-shared-base'
import {
    ChainId,
    createERC20Token,
    createNativeToken,
    SchemaType,
    useTokenConstants,
    UST,
} from '@masknet/web3-shared-evm'
import { useGasConfig, TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useChainId, useChainIdValid, useFungibleTokenBalance, useWallet, useAccount } from '@masknet/plugin-infra/web3'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { isFacebook } from '../../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../../social-network-adaptor/twitter.com/base'
import { useI18N } from '../../locales'
import { isNativeTokenWrapper } from '../../helpers'
import { PluginTraderMessages } from '../../messages'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import { useTradeCallback } from '../../trader/useTradeCallback'
import type { Coin } from '../../types'
import { TokenPanelType, TradeInfo } from '../../types'
import { ConfirmDialog } from './ConfirmDialog'
import { useSortedTrades } from './hooks/useSortedTrades'
import { useUpdateBalance } from './hooks/useUpdateBalance'
import { SettingsDialog } from './SettingsDialog'
import { TradeForm } from './TradeForm'
import { PriceImpactDialog } from './PriceImpactDialog'

const useStyles = makeStyles()(() => {
    return {
        root: {
            margin: 'auto',
        },
    }
})

export interface TraderProps extends withClasses<'root'> {
    coin?: Coin
    defaultInputCoin?: Coin
    defaultOutputCoin?: Coin
    tokenDetailed?: FungibleToken<ChainId, SchemaType>
    chainId?: ChainId
}

export interface TraderRef {
    refresh: () => void
}

export const Trader = forwardRef<TraderRef, TraderProps>((props: TraderProps, ref) => {
    const { defaultOutputCoin, coin, chainId: targetChainId, defaultInputCoin } = props
    const [focusedTrade, setFocusTrade] = useState<TradeInfo>()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const chainId = targetChainId ?? currentChainId
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM)
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const classes = useStylesExtends(useStyles(), props)
    const t = useI18N()
    const { setTargetChainId } = TargetChainIdContext.useContainer()

    // #region trade state
    const {
        setIsSwapping,
        tradeState: [
            { inputToken, outputToken, inputTokenBalance, outputTokenBalance, inputAmount },
            dispatchTradeStore,
        ],
        allTradeComputed,
        setTemporarySlippage,
    } = AllProviderTradeContext.useContainer()
    // #endregion

    useImperativeHandle(
        ref,
        () => ({
            refresh: () => {
                allTradeComputed.map((x) => x.retry())
            },
        }),
        [allTradeComputed],
    )

    // #region gas config and gas price
    const { gasPrice, gasConfig, setGasConfig } = useGasConfig(chainId)
    // #endregion

    // #region if chain id be changed, update input token be native token
    useEffect(() => {
        if (!chainIdValid) return

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
            token: chainId === ChainId.Mainnet && coin?.is_mirrored ? UST[ChainId.Mainnet] : createNativeToken(chainId),
        })
    }, [chainId, chainIdValid])
    // #endregion

    const updateTradingCoin = useCallback(
        (
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN | AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            coin?: Coin,
        ) => {
            if (!coin?.contract_address) return
            dispatchTradeStore({
                type,
                token: createERC20Token(chainId, coin.contract_address, coin.name, coin.symbol, coin.decimals),
            })
        },
        [chainId],
    )
    useEffect(() => {
        updateTradingCoin(AllProviderTradeActionType.UPDATE_INPUT_TOKEN, defaultInputCoin)
    }, [updateTradingCoin, defaultInputCoin])
    useEffect(() => {
        updateTradingCoin(AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN, defaultOutputCoin)
    }, [updateTradingCoin, defaultOutputCoin])

    // #region if coin be changed, update output token
    useEffect(() => {
        if (!coin || currentChainId !== targetChainId) return

        // if coin be native token and input token also be native token, reset it
        if (
            isSameAddress(coin.contract_address, NATIVE_TOKEN_ADDRESS) &&
            inputToken?.schema === SchemaType.Native &&
            coin.symbol === inputToken.symbol
        ) {
            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
                token: undefined,
            })
        }
        if (!outputToken) {
            updateTradingCoin(AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN, coin)
        }
    }, [coin, NATIVE_TOKEN_ADDRESS, inputToken, outputToken, currentChainId, targetChainId, updateTradingCoin])

    useEffect(() => {
        if (!defaultInputCoin) return
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
            token: defaultInputCoin.contract_address
                ? createERC20Token(
                      chainId,
                      defaultInputCoin.contract_address,
                      defaultInputCoin.name,
                      defaultInputCoin.symbol,
                      defaultInputCoin.decimals,
                  )
                : undefined,
        })
    }, [defaultInputCoin, chainId])

    const onInputAmountChange = useCallback((amount: string) => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
            amount,
        })
    }, [])

    // #region update balance
    const { value: inputTokenBalance_, loading: loadingInputTokenBalance } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        inputToken?.address ?? '',
        { chainId },
    )

    const { value: outputTokenBalance_, loading: loadingOutputTokenBalance } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        outputToken?.address ?? '',
        { chainId },
    )

    useEffect(() => {
        if (!inputToken || inputToken.schema === SchemaType.Native || !inputTokenBalance_ || loadingInputTokenBalance) {
            return
        }
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
            balance: inputTokenBalance_,
        })
    }, [inputToken, inputTokenBalance_, loadingInputTokenBalance])

    useEffect(() => {
        if (
            !outputToken ||
            outputToken.schema === SchemaType.Native ||
            !outputTokenBalance_ ||
            loadingOutputTokenBalance
        ) {
            return
        }
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
            balance: outputTokenBalance_,
        })
    }, [outputToken, outputTokenBalance_, loadingOutputTokenBalance])

    // #region select token
    const excludeTokens = [inputToken, outputToken].filter(Boolean).map((x) => x?.address) as string[]

    const selectFungibleToken = useSelectFungibleToken()
    const onTokenChipClick = useCallback(
        async (panelType: TokenPanelType) => {
            const picked = await selectFungibleToken({
                chainId,
                disableNativeToken: false,
                selectedTokens: excludeTokens,
            })
            if (picked) {
                dispatchTradeStore({
                    type:
                        panelType === TokenPanelType.Input
                            ? AllProviderTradeActionType.UPDATE_INPUT_TOKEN
                            : AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
                    token: picked as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
                })
            }
        },
        [excludeTokens.join(), chainId],
    )
    // #endregion

    // #region blocking (swap)
    const [{ loading: isTrading }, tradeCallback] = useTradeCallback(
        focusedTrade?.provider,
        focusedTrade?.value,
        gasConfig,
    )
    useEffect(() => {
        setIsSwapping(isTrading)
    }, [isTrading])

    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    const [priceImpactDialogOpen, setPriceImpactDialogOpen] = useState(false)

    const shareText = useMemo(() => {
        const isOnTwitter = isTwitter(activatedSocialNetworkUI)
        const isOnFacebook = isFacebook(activatedSocialNetworkUI)
        const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
        return focusedTrade?.value && inputToken && outputToken
            ? t.share_text({
                  input_amount: formatBalance(focusedTrade.value.inputAmount, inputToken.decimals, 6),
                  input_symbol: `${cashTag}${inputToken.symbol}`,
                  output_amount: formatBalance(focusedTrade.value.outputAmount, outputToken.decimals, 6),
                  output_symbol: `${cashTag}${outputToken.symbol}`,
                  account_promote: t.account_promote({
                      context: isOnTwitter ? 'twitter' : isOnFacebook ? 'facebook' : 'default',
                  }),
              })
            : ''
    }, [focusedTrade?.value, inputToken, outputToken, t])
    const openShareTxDialog = useOpenShareTxDialog()
    const onConfirmDialogConfirm = useCallback(async () => {
        setOpenConfirmDialog(false)
        await delay(100)
        const hash = await tradeCallback()
        if (typeof hash !== 'string') return
        await openShareTxDialog({
            hash,
            buttonLabel: activatedSocialNetworkUI.utils.share ? 'Share' : 'Confirm',
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
            amount: '',
        })
        setTemporarySlippage(undefined)
    }, [tradeCallback, shareText, openShareTxDialog])

    const onConfirmDialogClose = useCallback(() => {
        setOpenConfirmDialog(false)
        setTemporarySlippage(undefined)
    }, [])
    // #endregion

    // #region the click handler of switch arrow
    const onSwitchToken = useCallback(() => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
            token: outputToken,
        })

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            token: inputToken,
        })

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
            amount: '',
        })
    }, [dispatchTradeStore, inputToken, outputToken, inputAmount])

    // #region swap callback
    const onSwap = useCallback(() => {
        // no need to open the confirmation dialog if it (un)wraps the native token
        if (focusedTrade?.value && isNativeTokenWrapper(focusedTrade.value)) tradeCallback()
        else setOpenConfirmDialog(true)
    }, [focusedTrade, tradeCallback])
    // #endregion

    // #region The trades sort by best price (Estimate received * price - Gas fee * native token price)
    const sortedAllTradeComputed = useSortedTrades(allTradeComputed, chainId, gasPrice)
    // #endregion

    // Query the balance of native tokens on target chain
    useUpdateBalance(chainId)
    // #endregion

    // #region reset focused trade when chainId, inputToken, outputToken, inputAmount be changed
    useUpdateEffect(() => {
        setFocusTrade(undefined)
    }, [targetChainId, inputToken, outputToken, inputAmount])
    // #endregion

    // #region if chain id be changed, reset the chain id on context, and reset gas config
    useEffect(() => {
        if (!chainId) return
        setTargetChainId(chainId)
        setGasConfig(undefined)
    }, [chainId])
    // #endregion

    // #region if target chain id be changed, reset output token
    useUpdateEffect(() => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            token: undefined,
        })
    }, [targetChainId])
    // #endregion

    useEffect(() => {
        return PluginTraderMessages.swapSettingsUpdated.on((event) => {
            if (event.open) return
            if (event.gasConfig) setGasConfig(event.gasConfig)
        })
    }, [])

    useUnmount(() => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            token: undefined,
        })
    })

    // #region if trade has been changed, update the focused trade
    useUpdateEffect(() => {
        setFocusTrade((prev) => {
            const target = allTradeComputed.find((x) => prev?.provider === x.provider)
            return target ?? prev
        })
    }, [allTradeComputed])
    // #endregion

    return (
        <div className={classes.root}>
            <TradeForm
                account={account}
                trades={sortedAllTradeComputed}
                inputToken={inputToken}
                outputToken={outputToken}
                inputTokenBalance={inputTokenBalance}
                outputTokenBalance={outputTokenBalance}
                inputAmount={inputAmount}
                onInputAmountChange={onInputAmountChange}
                onTokenChipClick={onTokenChipClick}
                focusedTrade={focusedTrade}
                onFocusedTradeChange={(trade) => setFocusTrade(trade)}
                onSwap={onSwap}
                gasPrice={gasPrice}
                onSwitch={onSwitchToken}
            />
            {focusedTrade?.value && !isNativeTokenWrapper(focusedTrade.value) && inputToken && outputToken ? (
                <>
                    <ConfirmDialog
                        account={account}
                        wallet={wallet}
                        open={openConfirmDialog}
                        trade={focusedTrade.value}
                        gas={focusedTrade.gas.value}
                        gasPrice={gasPrice}
                        inputToken={inputToken}
                        outputToken={outputToken}
                        onConfirm={onConfirmDialogConfirm}
                        onClose={onConfirmDialogClose}
                        openPriceImpact={() => setPriceImpactDialogOpen(true)}
                    />
                    <PriceImpactDialog
                        open={priceImpactDialogOpen}
                        onClose={() => setPriceImpactDialogOpen(false)}
                        trade={focusedTrade.value}
                        onConfirm={() => {}}
                    />
                </>
            ) : null}
            <SettingsDialog />
        </div>
    )
})
