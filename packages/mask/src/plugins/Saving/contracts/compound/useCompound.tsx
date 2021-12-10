import { useState, useEffect } from 'react'
import CompoundControllerABI from '@masknet/web3-contracts/abis/CompoundController.json'
import ERC20Abi from '@masknet/web3-contracts/abis/ERC20.json'
import cTokenAbi from '@masknet/web3-contracts/abis/cToken.json'
import {
    ChainId,
    createContract,
    useChainId,
    useContract,
    useSavingConstants,
    useWeb3,
    ZERO_ADDRESS,
    useAccount,
} from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'
import { MARKETS } from './constants'

interface TokenInfo {
    address: string
    symbol: string
    name: string
    balance?: string
    decimals: number
    supplyApy?: number
    borrowApy?: number
}

export interface CompoundMarket {
    cToken: TokenInfo
    underlying: TokenInfo
}

const getMarketInfo = async (web3: any, market: CompoundMarket, account?: string): Promise<CompoundMarket | null> => {
    try {
        const cTokenContract = createContract(web3, market.cToken.address, cTokenAbi as AbiItem[])
        const cTokenBalance = await cTokenContract?.methods.balanceOf(account).call()

        const ethMantissa = 1e18
        const blocksPerDay = 6570 // 13.15 seconds per block
        const daysPerYear = 365

        const supplyRatePerBlock = await cTokenContract?.methods.supplyRatePerBlock().call()
        const borrowRatePerBlock = await cTokenContract?.methods.borrowRatePerBlock().call()
        const supplyApy = (Math.pow((supplyRatePerBlock / ethMantissa) * blocksPerDay + 1, daysPerYear) - 1) * 100
        const borrowApy = (Math.pow((borrowRatePerBlock / ethMantissa) * blocksPerDay + 1, daysPerYear) - 1) * 100

        let underlyingBalance = '0'
        if (market.underlying.address !== ZERO_ADDRESS) {
            const underlyingContract = createContract(web3, market.underlying.address, ERC20Abi as AbiItem[])
            underlyingBalance = await underlyingContract?.methods.balanceOf(account).call()
        } else {
            underlyingBalance = await web3.eth.getBalance(account)
        }

        return {
            cToken: { ...market.cToken, balance: cTokenBalance, supplyApy, borrowApy },
            underlying: { ...market.underlying, balance: underlyingBalance },
        }
    } catch (error) {
        return null
    }
}

export function useAllMarkets() {
    const chainId = useChainId()
    const web3 = useWeb3()
    const [allMarkets, setAllMarkets] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const { COMPOUND_CONTROLLER } = useSavingConstants(chainId)
    const account = useAccount()
    const controllerContract = useContract(COMPOUND_CONTROLLER, CompoundControllerABI as AbiItem[], false, chainId)

    useEffect(() => {
        const fetchMarkets = async () => {
            if (controllerContract && web3 && chainId === ChainId.Mainnet && account) {
                setIsLoading(true)
                try {
                    const promises = MARKETS.map((market) => {
                        return getMarketInfo(web3, market as unknown as CompoundMarket, account)
                    })
                    const results = await Promise.all(promises)
                    setAllMarkets(results as any)
                    setIsLoading(false)
                } catch (error) {
                    setIsLoading(false)
                }
            } else {
                setAllMarkets([])
            }
        }
        fetchMarkets()
    }, [controllerContract, web3, chainId, account])

    return allMarkets
}

export function useCheckMembership(account: string, cTokenAddress: string) {
    const [isMembership, setIsMembership] = useState(false)
    const { COMPOUND_CONTROLLER } = useSavingConstants(ChainId.Mainnet)
    const web3 = useWeb3()
    useEffect(() => {
        async function checkMembership() {
            const controllerContract = createContract(web3, COMPOUND_CONTROLLER!, CompoundControllerABI as AbiItem[])
            try {
                const isMember = await controllerContract?.methods.checkMembership(account, cTokenAddress).call()
                setIsMembership(isMember)
            } catch (error) {}
        }
        if (account && cTokenAddress) {
            checkMembership()
        }
    }, [account, cTokenAddress])

    return isMembership
}
