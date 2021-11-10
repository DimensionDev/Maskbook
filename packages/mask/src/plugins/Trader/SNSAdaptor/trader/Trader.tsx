import { useCallback, useEffect, useMemo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    createERC20Token,
    createNativeToken,
    EthereumTokenType,
    formatBalance,
    FungibleTokenDetailed,
    TransactionStateType,
    useChainId,
    useChainIdValid,
    useFungibleTokenBalance,
    useWallet,
} from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import type { Coin } from '../../types'
import { TokenPanelType, TradeInfo } from '../../types'
import { delay, useI18N } from '../../../../utils'
import { TradeForm } from './TradeForm'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import { DODO_BASE_URL, UST } from '../../constants'
import { SelectTokenDialogEvent, WalletMessages } from '@masknet/plugin-wallet'
import { useAsync, useTimeoutFn, useUpdateEffect } from 'react-use'
import { isTwitter } from '../../../../social-network-adaptor/twitter.com/base'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { isFacebook } from '../../../../social-network-adaptor/facebook.com/base'
import { useTradeCallback } from '../../trader/useTradeCallback'
import { isNativeTokenWrapper } from '../../helpers'
import { ConfirmDialog } from './ConfirmDialog'
import Services from '../../../../extension/service'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            minHeight: 266,
            position: 'relative',
        },
        progress: {
            bottom: theme.spacing(1),
            right: theme.spacing(1),
            position: 'absolute',
        },
        summary: {},
        router: {
            marginTop: 0,
        },
    }
})

export interface TraderProps extends withClasses<never> {
    coin?: Coin
    tokenDetailed?: FungibleTokenDetailed
    chainId?: ChainId
}

export function Trader(props: TraderProps) {
    const { coin, tokenDetailed, chainId: targetChainId } = props
    const { decimals } = tokenDetailed ?? coin ?? {}
    const [focusedTrade, setFocusTrade] = useState<TradeInfo>()
    const wallet = useWallet()
    const currentChainId = useChainId()
    const chainId = targetChainId ?? currentChainId
    const chainIdValid = useChainIdValid()
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()

    //#region trade state
    const {
        tradeState: [
            { inputToken, outputToken, inputTokenBalance, outputTokenBalance, inputAmount },
            dispatchTradeStore,
        ],
        allTradeComputed,
    } = AllProviderTradeContext.useContainer()

    const sortedAllTradeComputed = useMemo(() => {
        return allTradeComputed.sort(({ value: a }, { value: b }) => {
            if (a?.outputAmount.isGreaterThan(b?.outputAmount ?? 0)) return -1
            if (a?.outputAmount.isLessThan(b?.outputAmount ?? 0)) return 1
            return 0
        })
    }, [allTradeComputed])
    //endregion

    useEffect(() => {
        if (!chainIdValid) return
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
            token: chainId === ChainId.Mainnet && coin?.is_mirrored ? UST[ChainId.Mainnet] : createNativeToken(chainId),
        })
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            token: coin?.contract_address
                ? createERC20Token(chainId, coin.contract_address, decimals ?? 0, coin.name ?? '', coin.symbol ?? '')
                : undefined,
        })
    }, [coin, chainId, chainIdValid, decimals])

    const onInputAmountChange = useCallback((amount: string) => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
            amount,
        })
    }, [])

    //#region update balance
    const { value: inputTokenBalance_, loading: loadingInputTokenBalance } = useFungibleTokenBalance(
        inputToken?.type ?? EthereumTokenType.Native,
        inputToken?.address ?? '',
    )

    const { value: outputTokenBalance_, loading: loadingOutputTokenBalance } = useFungibleTokenBalance(
        outputToken?.type ?? EthereumTokenType.Native,
        outputToken?.address ?? '',
    )

    useEffect(() => {
        if (inputTokenBalance_ && !loadingInputTokenBalance)
            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
                balance: inputTokenBalance_,
            })
        if (outputTokenBalance_ && !loadingOutputTokenBalance)
            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
                balance: outputTokenBalance_,
            })
    }, [inputTokenBalance_, outputTokenBalance_, loadingInputTokenBalance, loadingOutputTokenBalance])
    //#endregion

    //#region select token
    const excludeTokens = [inputToken, outputToken].filter(Boolean).map((x) => x?.address) as string[]
    const [focusedTokenPanelType, setFocusedTokenPanelType] = useState(TokenPanelType.Input)

    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== String(focusedTokenPanelType)) return
                dispatchTradeStore({
                    type:
                        focusedTokenPanelType === TokenPanelType.Input
                            ? AllProviderTradeActionType.UPDATE_INPUT_TOKEN
                            : AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
                    token: ev.token,
                })
            },
            [dispatchTradeStore, focusedTokenPanelType],
        ),
    )

    const onTokenChipClick = useCallback(
        (type: TokenPanelType) => {
            setFocusedTokenPanelType(type)
            setSelectTokenDialog({
                open: true,
                uuid: String(type),
                disableNativeToken: false,
                FixedTokenListProps: {
                    selectedTokens: excludeTokens,
                },
            })
        },
        [excludeTokens.join()],
    )
    //#endregion

    //#region blocking (swap)
    const [tradeState, tradeCallback, resetTradeCallback] = useTradeCallback(
        focusedTrade?.provider,
        focusedTrade?.value,
    )
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    const onConfirmDialogConfirm = useCallback(async () => {
        setOpenConfirmDialog(false)
        await delay(100)
        await tradeCallback()
    }, [tradeCallback])

    const onConfirmDialogClose = useCallback(() => {
        setOpenConfirmDialog(false)
    }, [])
    //#endregion

    //#region refresh pairs
    const [, , resetTimeout] = useTimeoutFn(() => {
        // FIXME:
        // failed to update onRefreshClick callback
        onRefreshClick()
    }, 30 /* seconds */ * 1000 /* milliseconds */)

    const onRefreshClick = useCallback(async () => {
        allTradeComputed.forEach((trade) => trade.retry())
        resetTimeout()
    }, [allTradeComputed, resetTimeout])
    //#endregion

    //#region remote controlled transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            focusedTrade?.value && inputToken && outputToken
                ? [
                      `I just swapped ${formatBalance(
                          focusedTrade.value.inputAmount,
                          inputToken.decimals,
                          6,
                      )} ${cashTag}${inputToken.symbol} for ${formatBalance(
                          focusedTrade.value.outputAmount,
                          outputToken.decimals,
                          6,
                      )} ${cashTag}${outputToken.symbol}.${
                          isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                              ? `Follow @${
                                    isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')
                                } (mask.io) to swap cryptocurrencies on ${
                                    isTwitter(activatedSocialNetworkUI) ? 'Twitter' : 'Facebook'
                                }.`
                              : ''
                      }`,
                      '#mask_io',
                  ].join('\n')
                : '',
        )
        .toString()
    //#endregion

    //#region close the transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (tradeState?.type === TransactionStateType.HASH) {
                dispatchTradeStore({
                    type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
                    amount: '',
                })
            }
            resetTradeCallback()
        },
    )
    //#endregion

    //#region open the transaction dialog
    useEffect(() => {
        if (tradeState?.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            shareLink,
            state: tradeState,
        })
    }, [tradeState /* update tx dialog only if state changed */])
    //#endregion

    //#region swap callback
    const onSwap = useCallback(() => {
        // no need to open the confirmation dialog if it (un)wraps the native token
        if (focusedTrade?.value && isNativeTokenWrapper(focusedTrade.value)) tradeCallback()
        else setOpenConfirmDialog(true)
    }, [focusedTrade, tradeCallback])
    //#endregion

    //#region dodo permission
    useAsync(async () => {
        const hasPermission = await Services.Helper.queryExtensionPermission({
            origins: [`${DODO_BASE_URL}/`],
        })
        if (!hasPermission) {
            await Services.Helper.requestExtensionPermission({
                origins: [`${DODO_BASE_URL}/`],
                permissions: ['webRequest'],
            })
        }
    }, [])
    //#endregion

    //#region reset focused trade when chainId, inputToken, outputToken, inputAmount be changed
    useUpdateEffect(() => {
        setFocusTrade(undefined)
    }, [targetChainId, inputToken, outputToken, inputAmount])

    return (
        <div className={classes.root}>
            <TradeForm
                trades={sortedAllTradeComputed}
                inputToken={inputToken}
                outputToken={outputToken}
                inputTokenBalance={inputTokenBalance}
                outputTokenBalance={outputTokenBalance}
                inputAmount={inputAmount}
                onInputAmountChange={onInputAmountChange}
                onTokenChipClick={onTokenChipClick}
                onRefreshClick={onRefreshClick}
                focusedTrade={focusedTrade}
                onFocusedTradeChange={(trade) => setFocusTrade(trade)}
                onSwap={onSwap}
                chainId={chainId}
            />
            {focusedTrade?.value && !isNativeTokenWrapper(focusedTrade.value) && inputToken && outputToken ? (
                <ConfirmDialog
                    chainId={chainId}
                    wallet={wallet}
                    open={openConfirmDialog}
                    trade={focusedTrade.value}
                    inputToken={inputToken}
                    outputToken={outputToken}
                    onConfirm={onConfirmDialogConfirm}
                    onClose={onConfirmDialogClose}
                />
            ) : null}
        </div>
    )
}
