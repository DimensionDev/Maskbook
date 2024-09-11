import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount, useChainContext, useNativeToken } from '@masknet/web3-hooks-base'
import type { GetQuotesResponse, OKXSwapQuote } from '@masknet/web3-providers/types'
import { rightShift } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import {
    createContext,
    useContext,
    useMemo,
    useState,
    type Dispatch,
    type PropsWithChildren,
    type SetStateAction,
} from 'react'
import { base } from '../../../base.js'
import { DEFAULT_SLIPPAGE } from '../../constants.js'
import { useLiquidityResources } from '../hooks/useLiquidityResources.js'
import { useQuotes } from '../hooks/useQuotes.js'
import { useUsdtToken } from '../hooks/useUsdtToken.js'
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { useWalletId } from '../../storage.js'

interface Options {
    walletId: string | undefined
    chainId: ChainId
    setChainId: Dispatch<SetStateAction<ChainId>>
    nativeToken: Web3Helper.FungibleTokenAll | undefined
    fromToken: Web3Helper.FungibleTokenAll | undefined
    setFromToken: Dispatch<SetStateAction<Web3Helper.FungibleTokenAll | undefined>>
    toToken: Web3Helper.FungibleTokenAll | undefined
    setToToken: Dispatch<SetStateAction<Web3Helper.FungibleTokenAll | undefined>>
    quote: OKXSwapQuote | undefined
    isQuoteStale: boolean
    updateQuote: (options?: RefetchOptions) => Promise<QueryObserverResult<GetQuotesResponse>>
    quoteErrorMessage: string | undefined
    inputAmount: string
    setInputAmount: Dispatch<SetStateAction<string>>
    /**
     * Disabled dexId of the liquidity pool for limited quotes.
     * We record disabled ones only, if no disabled ones, we cna omit the parameter
     */
    disabledDexIds: string[]
    setDisabledDexIds: Dispatch<SetStateAction<string[]>>
    expand: boolean
    setExpand: Dispatch<SetStateAction<boolean>>
    slippage: string
    setSlippage: Dispatch<SetStateAction<string>>
    isAutoSlippage: boolean
    setIsAutoSlippage: Dispatch<SetStateAction<boolean>>
    networkFee: string
    setNetworkFee: Dispatch<SetStateAction<string>>
    /** Gas Limit */
    gas: string | undefined
}

const chainIds = base.enableRequirement.web3[NetworkPluginID.PLUGIN_EVM].supportedChainIds

const SwapContext = createContext<Options>(null!)
export function SwapProvider({ children }: PropsWithChildren) {
    const { chainId: contextChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const defaultChainId = chainIds.includes(contextChainId) ? contextChainId : ChainId.Mainnet
    const [chainId = defaultChainId, setChainId] = useState<ChainId>(defaultChainId)
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })
    const address = useAccount(NetworkPluginID.PLUGIN_EVM)
    const walletId = useWalletId(address)

    const usdtToken = useUsdtToken(chainId)
    const [fromToken = nativeToken, setFromToken] = useState<Web3Helper.FungibleTokenAll>()
    const [toToken = fromToken?.address === usdtToken?.address ? undefined : usdtToken, setToToken] =
        useState<Web3Helper.FungibleTokenAll>()

    const [inputAmount, setInputAmount] = useState('')
    const decimals = fromToken?.decimals
    const amount = useMemo(
        () => (inputAmount && decimals ? rightShift(inputAmount, decimals).toFixed(0) : ''),
        [inputAmount, decimals],
    )

    const [disabledDexIds, setDisabledDexIds] = useState<string[]>(EMPTY_LIST)
    const { data: liquidityRes } = useLiquidityResources(chainId)
    const dexIds = useMemo(() => {
        if (!liquidityRes?.data.length) return undefined
        const allIds = liquidityRes.data.map((x) => x.id)
        if (!disabledDexIds.length) return undefined
        return allIds.filter((x) => !disabledDexIds.includes(x))
    }, [disabledDexIds, liquidityRes?.data])

    const {
        data: quoteRes,
        isStale: isQuoteStale,
        refetch: updateQuote,
    } = useQuotes({
        chainId: chainId.toString(),
        amount,
        fromTokenAddress: fromToken?.address,
        toTokenAddress: toToken?.address,
        dexIds: dexIds?.length ? dexIds.join(',') : undefined,
    })
    const quote = quoteRes?.code === 0 ? quoteRes.data[0] : undefined
    const quoteErrorMessage = quoteRes?.msg

    // slippage
    const [isAutoSlippage, setIsAutoSlippage] = useState(true)
    const [slippage, setSlippage] = useState('')

    // misc, ui
    const [expand, setExpand] = useState(false)

    // Network fee
    const [networkFee, setNetworkFee] = useState('2') // Default to 'standard' fee

    const value = useMemo(
        () => ({
            walletId,
            chainId,
            setChainId,
            quote,
            isQuoteStale,
            updateQuote,
            nativeToken,
            fromToken,
            setFromToken,
            toToken,
            setToToken,
            inputAmount,
            setInputAmount,
            quoteErrorMessage,
            disabledDexIds,
            setDisabledDexIds,
            expand,
            setExpand,
            isAutoSlippage,
            setIsAutoSlippage,
            slippage: slippage || DEFAULT_SLIPPAGE,
            setSlippage,
            networkFee,
            setNetworkFee,
            gas: quote?.estimateGasFee,
        }),
        [
            walletId,
            chainId,
            quote,
            isQuoteStale,
            updateQuote,
            nativeToken,
            fromToken,
            toToken,
            inputAmount,
            quoteErrorMessage,
            disabledDexIds,
            expand,
            isAutoSlippage,
            slippage,
            setSlippage,
            networkFee,
        ],
    )
    return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>
}

export function useSwap() {
    return useContext(SwapContext)
}
