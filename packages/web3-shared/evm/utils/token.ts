import { createFungibleToken, createFungibleTokensFromConstants } from '@masknet/web3-shared-base'
import Token from '@masknet/web3-constants/evm/token.json'
import { chainResolver } from '.'
import { CHAIN_DESCRIPTORS, getTokenConstants, ZERO_ADDRESS } from '../constants'
import { ChainId, SchemaType } from '../types'
import { getEnumAsArray } from '@dimensiondev/kit'

export function isNativeTokenSymbol(symbol: string) {
    return CHAIN_DESCRIPTORS.filter((x) => x.network === 'mainnet' && x.nativeCurrency)
        .map((x) => x.nativeCurrency.symbol.toLowerCase())
        .includes(symbol.toLowerCase())
}

export function createNativeToken(chainId: ChainId) {
    const nativeCurrency = chainResolver.nativeCurrency(chainId)
    return createFungibleToken<ChainId, SchemaType.Native>(
        chainId,
        SchemaType.Native,
        getTokenConstants(chainId).NATIVE_TOKEN_ADDRESS ?? ZERO_ADDRESS,
        nativeCurrency?.name ?? 'Ether',
        nativeCurrency?.symbol ?? 'ETH',
        nativeCurrency?.decimals ?? 18,
        nativeCurrency?.logoURL as string | undefined,
    )
}

export function createERC20Token(
    chainId: ChainId,
    address: string,
    name = 'Unknown Token',
    symbol = '',
    decimals = 0,
    logoURI?: string,
) {
    return createFungibleToken<ChainId, SchemaType.ERC20>(
        chainId,
        SchemaType.ERC20,
        address,
        name,
        symbol,
        decimals,
        logoURI,
    )
}

export const createERC20Tokens = createFungibleTokensFromConstants(getEnumAsArray(ChainId), SchemaType.ERC20, Token)
