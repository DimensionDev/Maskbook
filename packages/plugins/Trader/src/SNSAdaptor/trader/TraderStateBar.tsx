import { useCallback, useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { alpha } from '@mui/system'
import { Box } from '@mui/material'
import { TokenSecurityBoundary } from '@masknet/plugin-go-plus-security'
import { useActivatedPluginsSNSAdaptor, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { useIsMinimalModeDashBoard } from '@masknet/plugin-infra/dashboard'
import {
    PluginWalletStatusBar,
    WalletConnectedBoundary,
    EthereumERC20TokenApprovedBoundary,
    useTokenSecurity,
    ChainBoundary,
} from '@masknet/shared'
import { NetworkPluginID, PluginID, PopupRoutes, Sniffings } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useEnvironmentContext, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { isLessThan, leftShift, multipliedBy, rightShift } from '@masknet/web3-shared-base'
import { ChainId, formatWeiToEther, SchemaType, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { MINIMUM_AMOUNT, MIN_GAS_LIMIT } from '../../constants/trader.js'
import { isNativeTokenWrapper } from '../../helpers/trader.js'
import { resolveTradeProviderName } from '../../pipes.js'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { useTradeApproveComputed } from '../../trader/useTradeApproveComputed.js'
import type { TradeComputed, TraderAPI } from '@masknet/web3-providers/types'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import type { NativeTokenWrapper } from '../../trader/native/useTradeComputed.js'
import { useI18N } from '../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    button: {
        borderRadius: 8,
    },
    disabledButton: {
        borderRadius: 8,
    },
    stateBar: {
        position: 'sticky',
        bottom: 0,
        boxShadow: `0px 0px 20px ${alpha(
            theme.palette.maskColor.shadowBottom,
            theme.palette.mode === 'dark' ? 0.12 : 0.05,
        )}`,
    },
    unlockContainer: {
        margin: 0,
        width: '100%',
        ['& > div']: {
            padding: '0px !important',
        },
    },
}))

export interface TradeStateBarProps {
    inputAmount: string
    focusedTrade?: AsyncStateRetry<TraderAPI.TradeInfo>
    inputToken?: Web3Helper.FungibleTokenAll
    outputToken?: Web3Helper.FungibleTokenAll
    trades: Array<AsyncStateRetry<TraderAPI.TradeInfo>>
    inputTokenBalance?: string
    gasPrice?: string
    onSwap: () => void
}
export function TraderStateBar({
    trades,
    focusedTrade,
    inputToken,
    outputToken,
    inputAmount,
    inputTokenBalance,
    gasPrice,
    onSwap,
}: TradeStateBarProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { pluginID: actualPluginID } = useEnvironmentContext()
    const Others = useWeb3Others()

    const { isSwapping } = AllProviderTradeContext.useContainer()
    const { openPopupWindow } = useSNSAdaptorContext()

    // #region if `isPopupPage` be true, click the plugin status bar need to  open popup window
    const openSelectWalletPopup = useCallback(() => {
        openPopupWindow?.(PopupRoutes.SelectWallet, {
            chainId,
        })
    }, [chainId, openPopupWindow])
    // #endregion

    // #region approve token
    const { approveToken, approveAmount, approveAddress } = useTradeApproveComputed(
        focusedTrade?.value?.value ?? null,
        focusedTrade?.value?.provider,
        inputToken,
    )
    // #endregion

    const snsAdaptorMinimalPlugins = useActivatedPluginsSNSAdaptor(true)
    const isSNSClosed = snsAdaptorMinimalPlugins?.map((x) => x.ID).includes(PluginID.GoPlusSecurity)
    const isDashboardClosed = useIsMinimalModeDashBoard(PluginID.GoPlusSecurity)

    const isTokenSecurityEnable = !isSNSClosed && !isDashboardClosed

    const { value: tokenSecurityInfo, error } = useTokenSecurity(
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
        outputToken?.address.trim(),
        isTokenSecurityEnable,
    )

    const isRisky = tokenSecurityInfo?.is_high_risk

    // #region form controls
    const inputTokenTradeAmount = rightShift(inputAmount || '0', inputToken?.decimals)
    // #endregion

    // #region token balance
    const inputTokenBalanceAmount = new BigNumber(inputTokenBalance || '0')
    // #endregion

    const maxAmount = useMemo(() => {
        const marginGasPrice = multipliedBy(gasPrice ?? 0, 1.1)
        const gasFee = multipliedBy(marginGasPrice, focusedTrade?.value?.gas ?? MIN_GAS_LIMIT)
        let amount_ = new BigNumber(inputTokenBalanceAmount.toFixed() ?? 0)
        amount_ = Others.isNativeTokenSchemaType(inputToken?.schema) ? amount_.minus(gasFee) : amount_
        return leftShift(BigNumber.max(0, amount_), inputToken?.decimals).toFixed(5)
    }, [focusedTrade, gasPrice, inputTokenTradeAmount, inputToken, Others.isNativeTokenSchemaType])

    // #region UI logic
    // validate form return a message if an error exists
    const validationMessage = useMemo(() => {
        if (inputTokenTradeAmount.isZero()) return t.plugin_trader_error_amount_absence()
        if (isLessThan(inputAmount, MINIMUM_AMOUNT)) return t.plugin_trade_error_input_amount_less_minimum_amount()
        if (!inputToken || !outputToken) return t.plugin_trader_error_amount_absence()
        if (!trades.length) return t.plugin_trader_error_insufficient_lp()

        if (
            inputTokenBalanceAmount.isLessThan(inputTokenTradeAmount) ||
            (Others.isNativeTokenSchemaType(inputToken.schema) &&
                formatWeiToEther(inputTokenTradeAmount).isGreaterThan(maxAmount))
        )
            return t.plugin_trader_error_insufficient_balance({
                symbol: inputToken?.symbol,
            })

        if (focusedTrade?.value && !focusedTrade.value.value?.outputAmount) return t.plugin_trader_no_enough_liquidity()
        return ''
    }, [
        inputAmount,
        focusedTrade,
        trades,
        inputToken,
        outputToken,
        inputTokenBalanceAmount.toFixed(),
        inputTokenTradeAmount.toFixed(),
        maxAmount,
        Others.isNativeTokenSchemaType,
    ])
    // #endregion

    // #region native wrap message
    const nativeWrapMessage = useMemo(() => {
        if (focusedTrade?.value) {
            if (isNativeTokenWrapper(focusedTrade.value.value)) {
                const trade_ = focusedTrade.value.value as TradeComputed<NativeTokenWrapper> | null
                return trade_?.trade_?.isWrap ? t.plugin_trader_wrap() : t.plugin_trader_unwrap()
            }
            return t.plugin_trader_swap_amount_symbol()
        } else {
            return t.plugin_trader_no_trade()
        }
    }, [focusedTrade, outputToken])
    // #endregion

    return (
        <Box className={classes.stateBar}>
            <PluginWalletStatusBar
                actualPluginID={actualPluginID}
                onClick={Sniffings.is_popup_page ? openSelectWalletPopup : undefined}>
                <WalletConnectedBoundary offChain expectedChainId={chainId}>
                    <EthereumERC20TokenApprovedBoundary
                        spender={approveAddress}
                        amount={approveAmount.toFixed()}
                        classes={{ container: classes.unlockContainer }}
                        contractName={
                            focusedTrade?.value?.provider ? resolveTradeProviderName(focusedTrade.value?.provider) : ''
                        }
                        infiniteUnlockContent={t.plugin_trader_unlock_symbol({
                            symbol: approveToken?.symbol || '',
                        })}
                        token={
                            !isNativeTokenWrapper(focusedTrade?.value?.value ?? null) &&
                            approveToken?.schema === SchemaType.ERC20 &&
                            !!approveAmount.toNumber()
                                ? approveToken
                                : undefined
                        }
                        ActionButtonProps={{
                            color: 'primary',
                            style: { borderRadius: 8 },
                            size: 'medium',
                        }}>
                        <ChainBoundary expectedChainId={chainId} expectedPluginID={pluginID}>
                            <TokenSecurityBoundary
                                tokenInfo={{
                                    name: tokenSecurityInfo?.token_name ?? '--',
                                    chainId: tokenSecurityInfo?.chainId ?? ChainId.Mainnet,
                                    contract: tokenSecurityInfo?.contract ?? ZERO_ADDRESS,
                                }}
                                disabled={
                                    focusedTrade?.loading || !focusedTrade?.value || !!validationMessage || isSwapping
                                }
                                onSwap={onSwap}
                                showTokenSecurity={!!(isTokenSecurityEnable && isRisky)}>
                                <ActionButton
                                    fullWidth
                                    loading={isSwapping}
                                    variant="contained"
                                    disabled={
                                        focusedTrade?.loading ||
                                        !focusedTrade?.value ||
                                        !!validationMessage ||
                                        isSwapping
                                    }
                                    classes={{ root: classes.button, disabled: classes.disabledButton }}
                                    color="primary"
                                    onClick={onSwap}>
                                    {validationMessage || nativeWrapMessage}
                                </ActionButton>
                            </TokenSecurityBoundary>
                        </ChainBoundary>
                    </EthereumERC20TokenApprovedBoundary>
                </WalletConnectedBoundary>
            </PluginWalletStatusBar>
        </Box>
    )
}
