import { BigNumber } from 'bignumber.js'
import { type FungibleAsset, leftShift, multipliedBy, TokenType, type Transaction } from '@masknet/web3-shared-base'
import { ChainId, getTokenConstant, SchemaType, formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm'
import {
    type ZerionAddressPosition,
    ZerionRBDTransactionType,
    type ZerionTransactionItem,
    ZerionTransactionStatus,
} from './types.js'

export function isValidAsset(data: ZerionAddressPosition) {
    const { asset, chain } = data
    const { address } = asset.implementations[chain]
    return isValidAddress(address)
}

export function formatAsset(chainId: ChainId, data: ZerionAddressPosition): FungibleAsset<ChainId, SchemaType> {
    const { asset, chain, quantity } = data
    const { address: address_, decimals } = asset.implementations[chain]
    const balance = leftShift(quantity, decimals).toNumber()
    const price = asset.price?.value ?? 0
    const isNativeToken = (symbol: string) =>
        ['ETH', 'BNB', 'MATIC', 'ARETH', 'AETH', 'ONE', 'ASTR', 'XDAI'].includes(symbol)
    const address = isNativeToken(asset.symbol) ? getTokenConstant(chainId, 'NATIVE_TOKEN_ADDRESS', '') : address_

    return {
        id: address,
        chainId,
        type: TokenType.Fungible,
        schema: SchemaType.ERC20,
        name: asset.name ?? 'Unknown Token',
        symbol: asset.symbol,
        decimals,
        address: formatEthereumAddress(address),
        logoURL: asset.icon_url,
        balance: quantity,
        price: {
            usd: new BigNumber(price).toString(),
        },
        value: {
            usd: multipliedBy(balance, price).toString(),
        },
    }
}

export function formatTransactions(
    chainId: ChainId,
    data: ZerionTransactionItem[],
): Array<Transaction<ChainId, SchemaType>> {
    return data
        .filter(({ type }) => type !== ZerionRBDTransactionType.AUTHORIZE)
        .map((transaction) => {
            const ethGasFee = leftShift(transaction.fee?.value ?? 0, 18).toString()
            const usdGasFee = multipliedBy(ethGasFee, transaction.fee?.price ?? 0).toString()

            return {
                id: transaction.hash,
                chainId: ChainId.Mainnet,
                type: transaction.type,
                filterType: transaction.type,
                from: transaction.address_from ?? '',
                to: transaction.address_to ?? '',
                timestamp: transaction.mined_at,
                status: transaction.status === ZerionTransactionStatus.FAILED ? 0 : 1,
                tokens:
                    transaction.changes?.map(({ asset, direction, value }) => {
                        return {
                            id: asset.asset_code,
                            // TODO: distinguish NFT
                            type: TokenType.Fungible,
                            schema: SchemaType.ERC20,
                            chainId,
                            name: asset.name,
                            symbol: asset.symbol,
                            address: asset.asset_code,
                            direction,
                            amount: leftShift(value, asset.decimals).toString(),
                            logoURI: asset.icon_url,
                        }
                    }) ?? [],
                fee: {
                    eth: ethGasFee,
                    usd: usdGasFee,
                },
            }
        })
}
