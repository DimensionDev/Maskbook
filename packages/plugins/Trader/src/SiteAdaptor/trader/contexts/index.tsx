import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNativeToken } from '@masknet/web3-hooks-base'
import type { OKXSwapQuote } from '@masknet/web3-providers/types'
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
import { useQuotes } from '../hooks/useQuotes.js'
import { useLiquidityResources } from '../hooks/useLiquidityResources.js'

interface Options {
    chainId: ChainId
    fromToken: Web3Helper.FungibleTokenAll | undefined
    setFromToken: Dispatch<SetStateAction<Web3Helper.FungibleTokenAll | undefined>>
    toToken: Web3Helper.FungibleTokenAll | undefined
    setToToken: Dispatch<SetStateAction<Web3Helper.FungibleTokenAll | undefined>>
    quote: OKXSwapQuote | undefined
    setQuote: Dispatch<SetStateAction<OKXSwapQuote | undefined>>
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
    mevProtection: boolean
    setMevProtection: Dispatch<SetStateAction<boolean>>
}

const SwapContext = createContext<Options>(null!)

const chainIds = base.enableRequirement.web3[NetworkPluginID.PLUGIN_EVM].supportedChainIds
export function SwapProvider({ children }: PropsWithChildren) {
    const { chainId: contextChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const chainId = chainIds.includes(contextChainId) ? contextChainId : ChainId.Mainnet
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })

    const [fromToken = nativeToken, setFromToken] = useState<Web3Helper.FungibleTokenAll>()
    const [toToken, setToToken] = useState<Web3Helper.FungibleTokenAll>()

    const [inputAmount, setInputAmount] = useState('')

    const [disabledDexIds, setDisabledDexIds] = useState<string[]>(EMPTY_LIST)
    const { data: liquidityRes } = useLiquidityResources(chainId)
    const dexIds = useMemo(() => {
        if (!liquidityRes?.data.length) return undefined
        const allIds = liquidityRes.data.map((x) => x.id)
        if (!disabledDexIds.length) return undefined
        return allIds.filter((x) => !disabledDexIds.includes(x))
    }, [disabledDexIds, liquidityRes?.data])

    const { data: quoteRes } = useQuotes({
        chainId: chainId.toString(),
        amount: inputAmount && fromToken?.decimals ? rightShift(inputAmount, fromToken.decimals).toFixed(0) : '',
        fromTokenAddress: fromToken?.address,
        toTokenAddress: toToken?.address,
        dexIds: dexIds?.length ? dexIds.join(',') : undefined,
    })
    const defaultQuote = quoteRes?.code === '0' ? quoteRes.data[0] : undefined
    const [quote = defaultQuote, setQuote] = useState<OKXSwapQuote>()
    const quoteErrorMessage = quoteRes?.msg

    // slippage
    const [isAutoSlippage, setIsAutoSlippage] = useState(true)
    const [slippage, setSlippage] = useState('')
    const [mevProtection, setMevProtection] = useState(true)

    // misc, ui
    const [expand, setExpand] = useState(false)

    const value = useMemo(
        () => ({
            chainId,
            quote,
            setQuote,
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
            slippage,
            setSlippage,
            mevProtection,
            setMevProtection,
        }),
        [
            chainId,
            quote,
            fromToken,
            toToken,
            inputAmount,
            quoteErrorMessage,
            disabledDexIds,
            expand,
            isAutoSlippage,
            slippage,
            setSlippage,
            mevProtection,
        ],
    )
    return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>
}

export function useSwap() {
    return useContext(SwapContext)
}
