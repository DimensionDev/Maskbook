import { createEetherToken } from '../helpers'
import { useChainId } from './useChainState'
import { useTokensDetailedDebank } from './useTokensDetailedDebank'
import { useTokensDetailed } from './useTokensDetailed'
import { useTokensDetailedMerged } from './useTokensDetailedMerged'
import type { Token } from '../types'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'

export function useTokensDetailedCallback(tokens: Token[]) {
    const chainId = useChainId()
    const wallet = useWallet()
    const chainDetailedTokens = useTokensDetailed(wallet?.address ?? '', [createEetherToken(chainId), ...tokens])
    const debankDetailedTokens = useTokensDetailedDebank(wallet?.address ?? '')

    // should place debank detailed tokens at the first place
    // it prevents them from replacing by previous detailed tokens because the uniq algorithm
    const detailedTokens = useTokensDetailedMerged(debankDetailedTokens, chainDetailedTokens)

    // filter out tokens in blacklist
    return detailedTokens.filter((x) => !wallet?.erc20_token_blacklist.has(formatChecksumAddress(x.token.address)))
}
