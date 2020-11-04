import { useAsyncRetry } from 'react-use'

import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { Token, EthereumTokenType } from '../types'
import { useChainId } from './useChainState'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'

function resolveSettleResult<T>(result: PromiseSettledResult<T>, fallback: T) {
    return result.status === 'fulfilled' ? result.value : fallback
}

/**
 * Fetch token info from chain
 * @param token
 */
export function useToken(token?: PartialRequired<Token, 'address' | 'type'>) {
    const chainId = useChainId()
    const erc20Contract = useERC20TokenContract(token?.address ?? '')

    return useAsyncRetry(async () => {
        if (!token?.address) return

        switch (token.type) {
            case EthereumTokenType.Ether:
                return {
                    type: EthereumTokenType.Ether,
                    chainId: token.chainId ?? chainId,
                    address: token.address,
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18,
                } as Token
            case EthereumTokenType.ERC20:
                if (!erc20Contract) return
                {
                    // TODO:
                    // fetch token info with multicall
                    const [name_, symbol_, decimals_] = await Promise.allSettled([
                        erc20Contract.methods.name().call(),
                        erc20Contract.methods.symbol().call(),
                        erc20Contract.methods.decimals().call(),
                    ])
                    return {
                        type: EthereumTokenType.ERC20,
                        chainId: token.chainId ?? chainId,
                        address: formatChecksumAddress(token.address),
                        name: resolveSettleResult(name_, token.name ?? ''),
                        symbol: resolveSettleResult(symbol_, token.symbol ?? ''),
                        decimals: Number.parseInt(resolveSettleResult(decimals_, String(token.decimals ?? 0)), 10),
                    } as Token
                }
            default:
                throw new Error('not supported')
        }
    }, [chainId, token?.type, token?.address, erc20Contract])
}
