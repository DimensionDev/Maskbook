import { useAsync } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { Token, EthereumTokenType } from '../types'
import { useChainId } from './useChainId'
import { useConstant } from './useConstant'

function resolveSettleResult<T>(result: PromiseSettledResult<T>, fallback: T) {
    return result.status === 'fulfilled' ? result.value : fallback
}

export function useToken(token?: PartialRequired<Token, 'address' | 'type'>) {
    const ETH_ADDRESS = useConstant('ETH_ADDRESS')
    const chainId = useChainId()
    const erc20Contract = useERC20TokenContract(token?.address ?? ETH_ADDRESS)

    return useAsync(async () => {
        if (!token) return
        if (!token?.address) return

        // Ether
        if (token.type === EthereumTokenType.Ether)
            return {
                type: EthereumTokenType.Ether,
                chainId: token.chainId ?? chainId,
                address: token.address,
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
            } as Token

        // validate address
        if (!EthereumAddress.isValid(token.address)) return

        // ERC20
        if (token.type === EthereumTokenType.ERC20) {
            if (!erc20Contract) return
            const [name_, symbol_, decimals_] = await Promise.allSettled([
                erc20Contract.methods.name().call(),
                erc20Contract.methods.symbol().call(),
                erc20Contract.methods.decimals().call(),
            ])
            return {
                type: EthereumTokenType.ERC20,
                chainId: token.chainId ?? chainId,
                address: EthereumAddress.checksumAddress(token.address),
                name: resolveSettleResult(name_, token.name ?? ''),
                symbol: resolveSettleResult(symbol_, token.symbol ?? ''),
                decimals: Number.parseInt(resolveSettleResult(decimals_, String(token.decimals ?? 0))),
            } as Token
        }

        // TODO:
        // ERC721
        throw new Error('not supported')
    }, [chainId, token?.type, token?.address, erc20Contract])
}
