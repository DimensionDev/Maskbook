import { createContract, getERC20TokenDetailed, useAugurConstants, useChainId, useWeb3 } from '@masknet/web3-shared'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import { useAsyncRetry } from 'react-use'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { useMmaLinkMarketFactory } from '../contracts/useMmaLinkMarketFactory'
import { useSportsLinkMarketFactory } from '../contracts/useSportsLinkMarketFactory'
import { PluginAugurRPC } from '../messages'
import { AmmExchange, Market, MarketType } from '../types'
import { AbiItem, isAddress } from 'web3-utils'
import { isZeroAddress } from 'ethereumjs-util'
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32'
import AugurBalancerPoolABI from '@masknet/web3-contracts/abis/AugurBalancerPool.json'
import type { AugurBalancerPool } from '@masknet/web3-contracts/types/AugurBalancerPool'

export function useAmmExchange(market: Market | undefined) {
    const web3 = useWeb3()
    const chainId = useChainId()

    const ammMarekFactoryContract = useAmmFactory(market?.ammExchange?.address ?? '')
    const sportLinkMarekFactoryContract = useSportsLinkMarketFactory(market?.address ?? '')
    const mmaMarekFactoryContract = useMmaLinkMarketFactory(market?.address ?? '')
    const { GRAPH_URL } = useAugurConstants()

    return useAsyncRetry(async () => {
        let shareFactor
        let lpToken

        if (
            !market ||
            !market.ammExchange ||
            !ammMarekFactoryContract ||
            !sportLinkMarekFactoryContract ||
            !mmaMarekFactoryContract ||
            !GRAPH_URL
        )
            return

        const ammExchange = await PluginAugurRPC.fetchAmmExchange(market.address, market.id, GRAPH_URL)
        const balances = await ammMarekFactoryContract.methods.getPoolBalances(market.address, market.id).call()
        const weights = await ammMarekFactoryContract.methods.getPoolWeights(market.address, market.id).call()
        const pool = await ammMarekFactoryContract.methods.getPool(market.address, market.id).call()

        const balancerPoolContract = createContract(web3, pool, AugurBalancerPoolABI as AbiItem[]) as AugurBalancerPool
        const totalSupply = (await balancerPoolContract.methods.totalSupply().call()) ?? '0'

        if (pool && isAddress(pool) && !isZeroAddress(pool)) {
            const erc20TokenContract = createContract(web3, pool, ERC20ABI as AbiItem[]) as ERC20
            const erc20TokenBytes32Contract = createContract(web3, pool, ERC20Bytes32ABI as AbiItem[]) as ERC20Bytes32
            lpToken = await getERC20TokenDetailed(pool, chainId, erc20TokenContract, erc20TokenBytes32Contract, {})
        }

        if (market.marketType === MarketType.Sport) {
            shareFactor = await sportLinkMarekFactoryContract.methods.shareFactor().call()
        } else if (market.marketType === MarketType.Mma) {
            shareFactor = await mmaMarekFactoryContract.methods.shareFactor().call()
        } else if (market.marketType === MarketType.Crypto) {
            // TODO: when augur deployed any crypto market
        }
        market.dirtyAmmExchnage = false
        return {
            ...ammExchange,
            address: market.ammExchange.address,
            balances,
            weights,
            shareFactor,
            lpToken,
            totalSupply,
        } as AmmExchange
    }, [market, market?.dirtyAmmExchnage])
}
