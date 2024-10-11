import { useGasConfig } from '@masknet/web3-hooks-evm'
import { multipliedBy, type GasOptionType } from '@masknet/web3-shared-base'
import {
    formatWeiToEther,
    ZERO_ADDRESS,
    type EIP1559GasConfig,
    type GasConfig,
    type GasOption,
} from '@masknet/web3-shared-evm'
import { type BigNumber } from 'bignumber.js'
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    type Dispatch,
    type PropsWithChildren,
    type SetStateAction,
} from 'react'
import { useTokenPrice } from '../hooks/useTokenPrice.js'
import { useTrade } from './TradeProvider.js'

interface Options {
    gasLimit: string | undefined
    gasFee: BigNumber
    gasCost: string
    gasConfig: GasConfig
    setGasConfig: Dispatch<SetStateAction<GasConfig | undefined>>
    gasOptions: Record<GasOptionType, GasOption> | null | undefined
    isLoadingGasOptions: boolean
}

const GasManagerContext = createContext<Options>(null!)
export function GasManager({ children }: PropsWithChildren) {
    const { quote, mode, bridgeQuote, chainId, fromToken, toToken } = useTrade()
    const gasLimit = mode === 'swap' ? quote?.estimateGasFee : bridgeQuote?.routerList[0]?.estimateGasFee
    const { gasConfig, setGasConfig, gasOptions, isLoadingGasOptions } = useGasConfig(chainId)
    const { data: price } = useTokenPrice(chainId, ZERO_ADDRESS)

    const fromTokenAddr = fromToken?.address
    const toTokenAddr = toToken?.address

    useEffect(() => {
        setGasConfig(undefined)
    }, [fromTokenAddr, toTokenAddr, chainId])

    const gasFee = useMemo(() => {
        const price = gasConfig.gasPrice ?? (gasConfig as EIP1559GasConfig).maxFeePerGas ?? '1'
        return multipliedBy(gasLimit ?? '1', price)
    }, [gasLimit, gasConfig.gasPrice])

    const gasCost = useMemo(() => {
        if (!price) return ''
        return multipliedBy(formatWeiToEther(gasFee), price ?? 0).toFixed(2)
    }, [gasFee, price])

    const value = useMemo(
        () => ({
            gasLimit,
            gasFee,
            gasCost,
            gasConfig,
            setGasConfig,
            gasOptions,
            isLoadingGasOptions,
        }),
        [gasLimit, gasConfig, gasOptions, isLoadingGasOptions, gasFee, gasCost],
    )
    return <GasManagerContext.Provider value={value}>{children}</GasManagerContext.Provider>
}

export function useGasManagement() {
    return useContext(GasManagerContext)
}
