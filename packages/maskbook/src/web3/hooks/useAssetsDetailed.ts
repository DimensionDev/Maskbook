import { useCallback } from 'react'
import { useAssetsDetailedDebank } from './useAssetsDetailedDebank'
import { useAssetsDetailedChain } from './useAssetsDetailedChain'
import { useAssetsDetailedMerged } from './useAssetsDetailedMerged'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../types'
import { useEtherTokenDetailed } from './useEtherTokenDetailed'

export function useAssetsDetailed(tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]) {
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
    } = useAssetsDetailedChain(etherTokenDetailed ? [etherTokenDetailed, ...tokens] : tokens)
    const {
        value: assetsDetailedDebank = [],
        loading: assetsDetailedDebankLoading,
        error: assetsDetailedDebankError,
        retry: retryAssetsDetailedDebank,
    } = useAssetsDetailedDebank()

    const detailedTokensRetry = useCallback(() => {
        retryEtherTokenDetailed()
        retryAssetsDetailedChain()
        retryAssetsDetailedDebank()
    }, [retryEtherTokenDetailed, retryAssetsDetailedChain, retryAssetsDetailedDebank])

    // should place debank detailed tokens at the first place
    // it prevents them from replacing by previous detailed tokens because the uniq algorithm
    const assetsDetailed = useAssetsDetailedMerged(assetsDetailedDebank, assetsDetailedChain)

    // filter out tokens in blacklist
    return {
        value: assetsDetailed.filter((x) => !wallet?.erc20_token_blacklist.has(formatChecksumAddress(x.token.address))),
        error: etherTokenDetailedError || assetsDetailedChainError || assetsDetailedDebankError,
        loading: etherTokenDetailedLoading || assetsDetailedChainLoading || assetsDetailedDebankLoading,
        retry: detailedTokensRetry,
    }
}
