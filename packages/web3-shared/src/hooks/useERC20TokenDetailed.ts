import { useAsyncRetry } from 'react-use'
import type { ERC20TokenDetailed, ERC20Token, ChainId } from '../types'
import { useChainId } from './useChainId'
import type { ERC20 } from '@masknet/contracts/types/ERC20'
import type { ERC20Bytes32 } from '@masknet/contracts/types/ERC20Bytes32'
import { useERC20TokenContract, useERC20TokenContracts } from '../contracts/useERC20TokenContract'
import { useERC20TokenBytes32Contract, useERC20TokenBytes32Contracts } from '../contracts/useERC20TokenBytes32Contract'
import { parseStringOrBytes32, createERC20Token } from '../utils'

export function useERC20TokenDetailed(address: string, token?: Partial<ERC20TokenDetailed>) {
    const chainId = useChainId()
    const erc20TokenContract = useERC20TokenContract(address)
    const erc20TokenBytes32Contract = useERC20TokenBytes32Contract(address)

    return useAsyncRetry(
        async () => getERC20TokenDetailed(chainId, erc20TokenContract, erc20TokenBytes32Contract, token),
        [chainId, token, erc20TokenContract, erc20TokenBytes32Contract],
    )
}

export function useERC20TokensDetailed(listOfToken: Pick<ERC20Token, 'type' | 'address'>[]) {
    const chainId = useChainId()
    const listOfAddress = listOfToken.map((t) => t.address)
    const erc20TokenContracts = useERC20TokenContracts(listOfAddress)
    const erc20TokenBytes32Contracts = useERC20TokenBytes32Contracts(listOfAddress)

    return useAsyncRetry(
        async () =>
            Promise.all(
                listOfToken.map(async (token, i) => {
                    const erc20TokenContract = erc20TokenContracts[i]
                    const erc20TokenBytes32Contract = erc20TokenBytes32Contracts[i]
                    return getERC20TokenDetailed(chainId, erc20TokenContract, erc20TokenBytes32Contract, token)
                }),
            ),
        [chainId, listOfToken, erc20TokenContracts, erc20TokenBytes32Contracts],
    )
}

async function getERC20TokenDetailed(
    chainId: ChainId,
    erc20TokenContract: ERC20 | null,
    erc20TokenBytes32Contract: ERC20Bytes32 | null,
    token?: Partial<ERC20TokenDetailed>,
) {
    const address = token?.address ?? ''
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
