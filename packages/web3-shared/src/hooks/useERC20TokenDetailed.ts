import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { ERC20TokenDetailed, ERC20Token, FungibleTokenDetailed, LoadingFailTokenDetailed } from '../types'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useChainId } from './useChainId'
import type { ERC20 } from '@masknet/contracts/types/ERC20'
import type { ERC20Bytes32 } from '@masknet/contracts/types/ERC20Bytes32'
import { useERC20TokenContract, useERC20TokenContracts } from '../contracts/useERC20TokenContract'
import { useERC20TokenBytes32Contract, useERC20TokenBytes32Contracts } from '../contracts/useERC20TokenBytes32Contract'
import { parseStringOrBytes32, createLoadingFailToken, createERC20Token } from '../utils'

export const LOADING_FAIL_TOKEN_NAME = 'TOKEN LOADING FAIL'

export function checkTokenLoadingFailed(name: string) {
    return name === LOADING_FAIL_TOKEN_NAME
}

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

    const tokenDetailed = useMemo(
        () =>
            createERC20Token(
                chainId,
                address,
                typeof _token.decimals === 'string' ? Number(_token.decimals) : _token.decimals,
                parseStringOrBytes32(_token.name, _token.nameBytes32, 'Unknown Token'),
                parseStringOrBytes32(_token.symbol, _token.symbolBytes32, 'Unknown'),
            ),
        [_token, chainId],
    )

    return {
        loading: asyncToken.loading,
        error: asyncToken.error ?? null,
        value: tokenDetailed,
    } as AsyncStateRetry<ERC20TokenDetailed>
}

export function useERC20TokensDetailed(listOfToken: Pick<ERC20Token, 'type' | 'address'>[]) {
    const chainId = useChainId()
    const listOfAddress = useMemo(() => listOfToken.map((t) => t.address), [JSON.stringify(listOfToken)])
    const erc20TokenContracts = useERC20TokenContracts(listOfAddress)
    const erc20TokenBytes32Contracts = useERC20TokenBytes32Contracts(listOfAddress)

    const { value: tokens, ...asyncTokens } = useAsyncRetry(async () => {
        return Promise.allSettled(
            listOfToken.map(async (token, i) => {
                const erc20TokenContract = erc20TokenContracts[i]
                const erc20TokenBytes32Contract = erc20TokenBytes32Contracts[i]
                const _token = await getToken(erc20TokenContract, erc20TokenBytes32Contract, token)
                return { address: token.address, ..._token }
            }),
        )
    }, [
        chainId,
        JSON.stringify(erc20TokenContracts),
        JSON.stringify(erc20TokenBytes32Contracts),
        JSON.stringify(listOfToken),
    ])

    const tokensDetailed = useMemo(
        () =>
            tokens
                ? tokens.map((token, i) =>
                      token.status === 'fulfilled'
                          ? createERC20Token(
                                chainId,
                                token.value.address,
                                typeof token.value.decimals === 'string'
                                    ? Number(token.value.decimals)
                                    : token.value.decimals,
                                parseStringOrBytes32(token.value.name, token.value.nameBytes32, 'Unknown Token'),
                                parseStringOrBytes32(token.value.symbol, token.value.symbolBytes32, 'Unknown'),
                            )
                          : createLoadingFailToken(listOfToken[i].address, chainId, token.reason),
                  )
                : [],
        [JSON.stringify(tokens), chainId],
    )

    return {
        loading: asyncTokens.loading,
        error: asyncTokens.error ?? null,
        value: tokensDetailed,
    } as AsyncStateRetry<(FungibleTokenDetailed | LoadingFailTokenDetailed)[]>
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
