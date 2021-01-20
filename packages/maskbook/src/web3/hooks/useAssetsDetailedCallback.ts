import { useAssetsDetailedDebank } from './useAssetsDetailedDebank'
import { useAssetsDetailedChain } from './useAssetsDetailedChain'
import { useAssetsDetailedMerged } from './useAssetsDetailedMerged'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../types'
import { useEtherTokenDetailed } from './useEtherTokenDetailed'
import { useCallback } from 'react'

export function useAssetsDetailedCallback(tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]) {
    const wallet = useWallet()
    const { loading: ethloading, value: etherTokenDetailed, retry: retryEtherTokenDetailed } = useEtherTokenDetailed()
    const { value: assetsDetailedChain = [], retry: retryAssetsDetailedChain } = useAssetsDetailedChain(
        etherTokenDetailed ? [etherTokenDetailed, ...tokens] : tokens,
    )
    const { loading, value: assetsDetailedDebank = [], retry: retryAssetsDetailedDebank } = useAssetsDetailedDebank()

    const retryDetailedTokens = useCallback(() => {
        retryEtherTokenDetailed()
        retryAssetsDetailedChain()
        retryAssetsDetailedDebank()
    }, [retryEtherTokenDetailed, retryAssetsDetailedChain, retryAssetsDetailedDebank])

    // should place debank detailed tokens at the first place
    // it prevents them from replacing by previous detailed tokens because the uniq algorithm
    const assetsDetailed = useAssetsDetailedMerged(assetsDetailedDebank, assetsDetailedChain)

    // filter out tokens in blacklist
    return {
        loading: loading && ethloading,
        value: assetsDetailed.filter((x) => !wallet?.erc20_token_blacklist.has(formatChecksumAddress(x.token.address))),
        retry: retryDetailedTokens,
    }
}
