import { useAssetsDetailedDebank } from './useAssetsDetailedDebank'
import { useAssetsDetailedChain } from './useAssetsDetailedChain'
import { useAssetsDetailedMerged } from './useAssetsDetailedMerged'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../types'
import { useEtherTokenDetailed } from './useEtherTokenDetailed'

export function useAssetsDetailedCallback(tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]) {
    const wallet = useWallet()
    const { value: etherTokenDetailed } = useEtherTokenDetailed()
    const assetsDetailedChain = useAssetsDetailedChain(etherTokenDetailed ? [etherTokenDetailed, ...tokens] : tokens)
    const assetsDetailedDebank = useAssetsDetailedDebank()

    // should place debank detailed tokens at the first place
    // it prevents them from replacing by previous detailed tokens because the uniq algorithm
    const assetsDetailed = useAssetsDetailedMerged(assetsDetailedDebank, assetsDetailedChain)

    // filter out tokens in blacklist
    return assetsDetailed.filter((x) => !wallet?.erc20_token_blacklist.has(formatChecksumAddress(x.token.address)))
}
