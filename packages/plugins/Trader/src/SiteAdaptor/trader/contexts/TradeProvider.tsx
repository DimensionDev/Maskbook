import { t } from '@lingui/macro'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type {
    GetBridgeQuoteResponse,
    GetQuotesResponse,
    OKXBridgeQuote,
    OKXSwapQuote,
} from '@masknet/web3-providers/types'
import { dividedBy, rightShift } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type Dispatch,
    type PropsWithChildren,
    type SetStateAction,
} from 'react'
import { DEFAULT_SLIPPAGE } from '../../constants.js'
import { fixBridgeMessage } from '../helpers.js'
import { useBridgeQuotes } from '../hooks/useBridgeQuotes.js'
import { useDefaultToken } from '../hooks/useDefaultToken.js'
import { useLiquidityResources } from '../hooks/useLiquidityResources.js'
import { useQuotes } from '../hooks/useQuotes.js'
import { useDefaultParams } from './useDefaultParams.js'
import { useMode, type TradeMode } from './useMode.js'

interface Options {
    chainId: ChainId
    nativeToken: Web3Helper.FungibleTokenAll | undefined
    mode: TradeMode
    fromToken: Web3Helper.FungibleTokenAll | undefined
    setFromToken: Dispatch<SetStateAction<Web3Helper.FungibleTokenAll | undefined>>
    toToken: Web3Helper.FungibleTokenAll | undefined
    setToToken: Dispatch<SetStateAction<Web3Helper.FungibleTokenAll | undefined>>
    quote: OKXSwapQuote | undefined
    isQuoteStale: boolean
    isQuoteLoading: boolean
    updateQuote: (options?: RefetchOptions) => Promise<QueryObserverResult<GetQuotesResponse>>
    swapQuoteErrorMessage: string | undefined
    inputAmount: string
    setInputAmount: Dispatch<SetStateAction<string>>
    amount: string
    /**
     * Disabled dexId of the liquidity pool for limited quotes.
     * We record disabled ones only, if no disabled ones, we cna omit the parameter
     */
    disabledDexIds: string[]
    setDisabledDexIds: Dispatch<SetStateAction<string[]>>
    expand: boolean
    setExpand: Dispatch<SetStateAction<boolean>>
    slippage: string
    setSlippage: Dispatch<SetStateAction<string | undefined>>
    isAutoSlippage: boolean
    setIsAutoSlippage: Dispatch<SetStateAction<boolean>>
    /** Gas Limit */
    gas: string | undefined
    bridgeQuote: OKXBridgeQuote | undefined
    isBridgeQuoteStale: boolean
    isBridgeQuoteLoading: boolean
    updateBridgeQuote: (options?: RefetchOptions) => Promise<QueryObserverResult<GetBridgeQuoteResponse>>
    bridgeQuoteErrorMessage: string | undefined
    reset: () => void
}

function useModeState<T>(mode: TradeMode): [T | undefined, Dispatch<SetStateAction<T | undefined>>]
function useModeState<T>(mode: TradeMode, defaultValue: T): [T, Dispatch<SetStateAction<T>>]

function useModeState<T>(mode: TradeMode, defaultValue?: T): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
    const [map, setMap] = useState<Record<TradeMode, T | undefined>>(() => ({
        swap: defaultValue,
        bridge: defaultValue,
    }))

    const setValue: Dispatch<SetStateAction<T | undefined>> = useCallback(
        (val) => {
            setMap((map) => ({
                ...map,
                [mode]: typeof val === 'function' ? (val as (prevState: any) => any)(map[mode]) : val,
            }))
        },
        [mode],
    )

    const value = map[mode]
    return [value, setValue] as const
}

const SwapContext = createContext<Options>(null!)
const otherChainIdMap: Record<number, ChainId> = {
    [ChainId.BSC]: ChainId.Mainnet,
    [ChainId.Mainnet]: ChainId.BSC,
}
export function TradeProvider({ children }: PropsWithChildren) {
    const { chainId: defaultChainId, nativeToken, paramToToken } = useDefaultParams()

    const mode = useMode()

    const [fromToken = nativeToken, setFromToken] = useModeState<Web3Helper.FungibleTokenAll | undefined>(mode)
    const chainId = fromToken?.chainId || defaultChainId

    const defaultToToken = useDefaultToken(
        mode === 'bridge' ? otherChainIdMap[chainId] || ChainId.Mainnet : chainId,
        fromToken?.address,
    )
    const [toToken = paramToToken || defaultToToken, setToToken] = useModeState<Web3Helper.FungibleTokenAll>(mode)

    const [inputAmount, setInputAmount] = useModeState(mode, '')
    const decimals = fromToken?.decimals
    const amount = useMemo(
        () => (inputAmount && decimals ? rightShift(inputAmount, decimals).toFixed(0) : ''),
        [inputAmount, decimals],
    )

    const [disabledDexIds, setDisabledDexIds] = useModeState<string[]>(mode, EMPTY_LIST)
    const { data: liquidityList } = useLiquidityResources(chainId)
    const dexIds = useMemo(() => {
        if (!liquidityList?.length) return undefined
        const allIds = liquidityList.map((x) => x.id)
        if (!disabledDexIds.length) return undefined
        return allIds.filter((x) => !disabledDexIds.includes(x))
    }, [disabledDexIds, liquidityList])

    // slippage
    const [isAutoSlippage, setIsAutoSlippage] = useModeState(mode, true)
    const [slippage = DEFAULT_SLIPPAGE, setSlippage] = useModeState<string>(mode)

    const {
        data: quoteRes,
        isStale: isQuoteStale,
        isLoading: isQuoteLoading,
        refetch: updateQuote,
    } = useQuotes(
        {
            amount,
            chainId: chainId.toString(),
            fromTokenAddress: fromToken?.address,
            dexIds: dexIds?.length ? dexIds.join(',') : undefined,
            toTokenAddress: toToken?.address,
        },
        mode === 'swap',
    )
    const quote = quoteRes?.code === 0 ? quoteRes.data[0] : undefined
    const swapQuoteErrorMessage =
        quoteRes?.msg ??
        (quoteRes?.code === 0 && !quoteRes.data.length ?
            t`Swaps between this token pair are’t supported at the moment. You can try with third-party DApps instead.`
        :   '')

    const {
        data: bridgeQuoteRes,
        isStale: isBridgeQuoteStale,
        isPending: isBridgeQuoteLoading,
        refetch: updateBridgeQuote,
    } = useBridgeQuotes(
        {
            fromChainId: fromToken?.chainId.toString(),
            fromTokenAddress: fromToken?.address,
            amount,
            toChainId: toToken?.chainId.toString(),
            toTokenAddress: toToken?.address,
            slippage: dividedBy(slippage, 100).toFixed(),
        },
        mode === 'bridge',
    )
    const bridgeQuote = bridgeQuoteRes?.code === 0 ? bridgeQuoteRes.data[0] : undefined
    const bridgeQuoteErrorMessage =
        bridgeQuoteRes?.msg ??
        (bridgeQuoteRes?.code === 0 && !bridgeQuoteRes.data.length ?
            t`Bridge between this token pair are't supported at the moment.`
        :   '')

    // misc, ui
    const [expand, setExpand] = useModeState(mode, false)

    const reset = useCallback(() => {
        setFromToken(undefined)
        setToToken(undefined)
        setSlippage(undefined)
        setDisabledDexIds(EMPTY_LIST)
        setInputAmount('')
    }, [setFromToken, setToToken, setSlippage])

    const value = useMemo(
        () => ({
            chainId,
            mode,
            quote,
            isQuoteStale,
            isQuoteLoading,
            updateQuote,
            nativeToken,
            fromToken,
            setFromToken,
            toToken,
            setToToken,
            inputAmount,
            setInputAmount,
            amount,
            swapQuoteErrorMessage,
            disabledDexIds,
            setDisabledDexIds,
            expand,
            setExpand,
            isAutoSlippage,
            setIsAutoSlippage,
            slippage,
            setSlippage,
            gas: quote?.estimateGasFee,
            bridgeQuote,
            isBridgeQuoteStale,
            isBridgeQuoteLoading,
            updateBridgeQuote,
            bridgeQuoteErrorMessage: fixBridgeMessage(bridgeQuoteErrorMessage, fromToken),
            reset,
        }),
        [
            chainId,
            mode,
            quote,
            isQuoteStale,
            isQuoteLoading,
            updateQuote,
            nativeToken,
            fromToken,
            setFromToken,
            toToken,
            setToToken,
            inputAmount,
            setInputAmount,
            amount,
            swapQuoteErrorMessage,
            disabledDexIds,
            setDisabledDexIds,
            expand,
            isAutoSlippage,
            setIsAutoSlippage,
            slippage,
            setSlippage,
            bridgeQuote,
            isBridgeQuoteStale,
            isBridgeQuoteLoading,
            updateBridgeQuote,
            bridgeQuoteErrorMessage,
            reset,
        ],
    )
    return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>
}

export function useTrade() {
    return useContext(SwapContext)
}

export { type TradeMode } from './useMode.js'
