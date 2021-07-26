import { useAsyncRetry } from 'react-use'
import { ERC20TokenDetailed, FungibleToken, ChainId, EthereumTokenType, FungibleTokenDetailed } from '../types'
import { useChainId } from './useChainId'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32'
import { useERC20TokenContract, useERC20TokenContracts } from '../contracts/useERC20TokenContract'
import { useERC20TokenBytes32Contract, useERC20TokenBytes32Contracts } from '../contracts/useERC20TokenBytes32Contract'
import { parseStringOrBytes32, createERC20Token, createNativeToken } from '../utils'
import { useMemo } from 'react'

export function useERC20TokenDetailed(address?: string, token?: Partial<ERC20TokenDetailed>) {
    const chainId = useChainId()
    const erc20TokenContract = useERC20TokenContract(address)
    const erc20TokenBytes32Contract = useERC20TokenBytes32Contract(address)

    return useAsyncRetry(async () => {
        if (!address) return
        return getERC20TokenDetailed(address, chainId, erc20TokenContract, erc20TokenBytes32Contract, token)
    }, [chainId, token, erc20TokenContract, erc20TokenBytes32Contract, address])
}

export function useFungibleTokensDetailed(listOfToken: Pick<FungibleToken, 'address' | 'type'>[]) {
    const chainId = useChainId()
    const listOfAddress = useMemo(() => listOfToken.map((t) => t.address), [JSON.stringify(listOfToken)])
    const erc20TokenContracts = useERC20TokenContracts(listOfAddress)
    const erc20TokenBytes32Contracts = useERC20TokenBytes32Contracts(listOfAddress)

    return useAsyncRetry<FungibleTokenDetailed[]>(
        async () =>
            Promise.all(
                listOfToken.map(async (token, i) => {
                    if (token.type === EthereumTokenType.Native) return createNativeToken(chainId)

                    const erc20TokenContract = erc20TokenContracts[i]
                    const erc20TokenBytes32Contract = erc20TokenBytes32Contracts[i]
                    return getERC20TokenDetailed(
                        token.address,
                        chainId,
                        erc20TokenContract,
                        erc20TokenBytes32Contract,
                        token as Partial<ERC20TokenDetailed>,
                    )
                }),
            ),
        [
            chainId,
            JSON.stringify(listOfToken),
            JSON.stringify(erc20TokenContracts),
            JSON.stringify(erc20TokenBytes32Contracts),
        ],
    )
}

async function getERC20TokenDetailed(
    address: string,
    chainId: ChainId,
    erc20TokenContract: ERC20 | null,
    erc20TokenBytes32Contract: ERC20Bytes32 | null,
    token?: Partial<ERC20TokenDetailed>,
) {
    const results = await Promise.allSettled([
        token?.name ?? (await (erc20TokenContract?.methods.name().call() ?? '')),
        token?.name ? '' : await (erc20TokenBytes32Contract?.methods.name().call() ?? ''),
        token?.symbol ?? (await (erc20TokenContract?.methods.symbol().call() ?? '')),
        token?.symbol ? '' : await (erc20TokenBytes32Contract?.methods.symbol().call() ?? ''),
        token?.decimals ?? (await (erc20TokenContract?.methods.decimals().call() ?? '0')),
    ])
    const [name, nameBytes32, symbol, symbolBytes32, decimals] = results.map((result) =>
        result.status === 'fulfilled' ? result.value : '',
    ) as string[]
    return createERC20Token(
        chainId,
        address,
        typeof decimals === 'string' ? Number.parseInt(decimals) : decimals,
        parseStringOrBytes32(name, nameBytes32, 'Unknown Token'),
        parseStringOrBytes32(symbol, symbolBytes32, 'Unknown'),
    )
}
