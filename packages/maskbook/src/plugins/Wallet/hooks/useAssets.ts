import { useCallback } from 'react'
import { useAssetsFromProvider } from './useAssetsFromProvider'
import { useAssetsFromChain } from './useAssetsFromChain'
import { useAssetsMerged } from './useAssetsMerged'
import { useWallet } from './useWallet'
import { formatChecksumAddress } from '../formatter'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'

export function useAssets(tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]) {
    const wallet = useWallet()
    const {
        value: etherTokenDetailed,
        loading: etherTokenDetailedLoading,
        error: etherTokenDetailedError,
        retry: retryEtherTokenDetailed,
    } = useEtherTokenDetailed()
    const {
        value: assetsDetailedChain = [],
        loading: assetsDetailedChainLoading,
        error: assetsDetailedChainError,
        retry: retryAssetsDetailedChain,
    } = useAssetsFromChain(etherTokenDetailed ? [etherTokenDetailed, ...tokens] : tokens)
    const {
        value: assetsDetailedDebank = [],
        loading: assetsDetailedDebankLoading,
        error: assetsDetailedDebankError,
        retry: retryAssetsDetailedDebank,
    } = useAssetsFromProvider()

    const detailedTokensRetry = useCallback(() => {
        retryEtherTokenDetailed()
        retryAssetsDetailedChain()
        retryAssetsDetailedDebank()
    }, [retryEtherTokenDetailed, retryAssetsDetailedChain, retryAssetsDetailedDebank])

    // should place debank detailed tokens at the first place
    // it prevents them from replacing by previous detailed tokens because the uniq algorithm
    const assetsDetailed = useAssetsMerged(assetsDetailedDebank, assetsDetailedChain)

    console.log({
        assetsDetailedChain,
        assetsDetailedDebank,

        assetsDetailed,
    })

    // filter out tokens in blacklist
    return {
        value: assetsDetailed.filter((x) => !wallet?.erc20_token_blacklist.has(formatChecksumAddress(x.token.address))),
        error: etherTokenDetailedError || assetsDetailedChainError || assetsDetailedDebankError,
        loading: etherTokenDetailedLoading || assetsDetailedChainLoading || assetsDetailedDebankLoading,
        retry: detailedTokensRetry,
    }
}
