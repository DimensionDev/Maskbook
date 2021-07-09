import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { ERC20TokenDetailed, EthereumTokenType, ChainId, ERC20Token, FungibleTokenDetailed } from '../types'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useChainId } from './useChainId'
import type { ERC20 } from '@masknet/contracts/types/ERC20'
import type { ERC20Bytes32 } from '@masknet/contracts/types/ERC20Bytes32'
import { useERC20TokenContract, useERC20TokenContracts } from '../contracts/useERC20TokenContract'
import { useERC20TokenBytes32Contract, useERC20TokenBytes32Contracts } from '../contracts/useERC20TokenBytes32Contract'
import { formatEthereumAddress, parseStringOrBytes32 } from '../utils'

export function useERC20TokenDetailed(address: string, token?: Partial<ERC20TokenDetailed>) {
    const chainId = useChainId()
    const erc20TokenContract = useERC20TokenContract(address)
    const erc20TokenBytes32Contract = useERC20TokenBytes32Contract(address)

    const {
        value: _token = {
            name: token?.name ?? '',
            nameBytes32: '',
            symbol: token?.symbol ?? '',
            symbolBytes32: '',
            decimals: token?.decimals ?? '0',
        },
        ...asyncToken
    } = useAsyncRetry(async () => {
        return getToken(erc20TokenContract, erc20TokenBytes32Contract, token)
    }, [erc20TokenContract, erc20TokenBytes32Contract, token, chainId])

    const tokenDetailed = useMemo(() => createTokenDetailed(address, _token, chainId), [_token, chainId])

    return {
        loading: asyncToken.loading,
        error: asyncToken.error ?? null,
        value: tokenDetailed,
    } as AsyncStateRetry<ERC20TokenDetailed>
}

export function useERC20TokensDetailed(listOfToken: Pick<ERC20Token, 'type' | 'address'>[]) {
    const chainId = useChainId()
    const listOfAddress = listOfToken.map((t) => t.address)
    const erc20TokenContracts = useERC20TokenContracts(listOfAddress)
    const erc20TokenBytes32Contracts = useERC20TokenBytes32Contracts(listOfAddress)
    const initTokens = listOfToken.map((token) => ({
        name: '',
        address: token.address,
        nameBytes32: '',
        symbol: '',
        symbolBytes32: '',
        decimals: '0',
    }))
    const { value: tokens = initTokens, ...asyncTokens } = useAsyncRetry(async () => {
        return await Promise.all(
            listOfToken.map(async (token, i) => {
                const erc20TokenContract = erc20TokenContracts[i]
                const erc20TokenBytes32Contract = erc20TokenBytes32Contracts[i]
                const _token = await getToken(erc20TokenContract, erc20TokenBytes32Contract, token)
                return { address: token.address, ..._token }
            }),
        )
    }, [chainId, erc20TokenContracts, erc20TokenBytes32Contracts])

    const tokensDetailed = useMemo(
        () => tokens.map((token) => (token ? createTokenDetailed(token.address, token, chainId) : null)),
        [tokens, chainId],
    )

    return {
        loading: asyncTokens.loading,
        error: asyncTokens.error ?? null,
        value: tokensDetailed,
    } as AsyncStateRetry<FungibleTokenDetailed[]>
}

async function getToken(
    erc20TokenContract: ERC20 | null,
    erc20TokenBytes32Contract: ERC20Bytes32 | null,
    token: Partial<ERC20TokenDetailed> | undefined,
) {
    const name = token?.name ?? (await (erc20TokenContract?.methods.name().call() ?? ''))
    const nameBytes32 = await (erc20TokenBytes32Contract?.methods.name().call() ?? '')
    const symbol = token?.symbol ?? (await (erc20TokenContract?.methods.symbol().call() ?? ''))
    const symbolBytes32 = await (erc20TokenBytes32Contract?.methods.symbol().call() ?? '')
    const decimals = token?.decimals ?? (await (erc20TokenContract?.methods.decimals().call() ?? '0'))
    return { name, nameBytes32, symbol, symbolBytes32, decimals }
}

function createTokenDetailed(
    address: string,
    token: {
        name: string
        nameBytes32: string
        symbol: string
        symbolBytes32: string
        decimals: string | number
    },
    chainId: ChainId,
) {
    return {
        type: EthereumTokenType.ERC20,
        address: formatEthereumAddress(address),
        chainId,
        symbol: parseStringOrBytes32(token.symbol, token.symbolBytes32, 'UNKNOWN'),
        name: parseStringOrBytes32(token.name, token.nameBytes32, 'Unknown Token'),
        decimals: typeof token.decimals === 'string' ? Number.parseInt(token.decimals, 10) : token.decimals,
    } as FungibleTokenDetailed
}
