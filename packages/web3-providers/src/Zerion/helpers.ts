import { createLookupTableResolver } from '@masknet/shared-base'
import {
    type FungibleAsset,
    isGte,
    leftShift,
    multipliedBy,
    toFixed,
    TokenType,
    type Transaction,
    type TransactionAsset,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import {
    ChainId,
    formatAmount,
    formatEthereumAddress,
    getTokenConstant,
    isValidAddress,
    SchemaType,
} from '@masknet/web3-shared-evm'
import { BigNumber } from 'bignumber.js'
import { compact } from 'lodash-es'
import { type Transaction as RestTransaction } from './reset-types.js'
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

function isNativeToken(symbol: string) {
    // cspell:disable-next-line
    return ['ETH', 'BNB', 'MATIC', 'POL', 'ARETH', 'AETH', 'ONE', 'ASTR', 'XDAI'].includes(symbol)
}
export function formatAsset(chainId: ChainId, data: ZerionAddressPosition): FungibleAsset<ChainId, SchemaType> {
    const { asset, chain, quantity } = data
    const { address: address_, decimals } = asset.implementations[chain]
    const balance = leftShift(quantity, decimals).toNumber()
    const price = asset.price?.value ?? 0
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

function normalizeTxStatus(status: ZerionTransactionStatus): TransactionStatusType {
    const map: Record<ZerionTransactionStatus, TransactionStatusType> = {
        [ZerionTransactionStatus.FAILED]: TransactionStatusType.FAILED,
        [ZerionTransactionStatus.CONFIRMED]: TransactionStatusType.SUCCEED,
        [ZerionTransactionStatus.PENDING]: TransactionStatusType.NOT_DEPEND,
    }
    return map[status]
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
                cateType: transaction.type,
                from: transaction.address_from ?? '',
                to: transaction.address_to ?? '',
                timestamp: transaction.mined_at,
                status: normalizeTxStatus(transaction.status),
                assets:
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

// lower than real maximum.
const MaxUint256 = toFixed('0xffffffffffffffffffffffffffffffffffffffffff0000000000000000000000')
const statusMap: Record<RestTransaction['attributes']['status'], TransactionStatusType> = {
    confirmed: TransactionStatusType.SUCCEED,
    failed: TransactionStatusType.FAILED,
    pending: TransactionStatusType.NOT_DEPEND,
}
const directionMap: Record<'in' | 'out' | 'self', TransactionAsset<ChainId, SchemaType>['direction']> = {
    in: 'receive',
    out: 'send',
    self: 'self',
}
export function formatRestTransaction(transaction: RestTransaction): Transaction<ChainId, SchemaType> | null {
    const zerionChainId = transaction.relationships?.chain.data.id
    const chainId = zerionChainId ? zerionChainIdResolver(zerionChainId) : null
    if (!chainId) return null
    const attrs = transaction.attributes
    const assets = attrs.transfers.map((x): TransactionAsset<ChainId, SchemaType> | null => {
        if (x.fungible_info) {
            const implement = x.fungible_info.implementations.find((x) => x.chain_id === zerionChainId)
            const amount = isGte(x.quantity.int, MaxUint256) ? 'unlimited' : x.quantity.float.toString()
            return {
                id: x.fungible_info.symbol,
                type: TokenType.Fungible,
                schema: implement?.address ? SchemaType.ERC20 : SchemaType.Native,
                chainId,
                name: x.fungible_info.name,
                symbol: x.fungible_info.symbol,
                address: implement!.address!,
                direction: directionMap[x.direction],
                amount,
                sender: x.sender,
                recipient: x.recipient,
            }
        } else if (x.nft_info) {
            return {
                id: `${x.nft_info?.contract_address} + ${x.nft_info?.token_id}`,
                type: TokenType.NonFungible,
                schema: SchemaType.ERC721,
                chainId,
                name: x.nft_info.name!,
                symbol: '',
                address: x.nft_info.contract_address,
                direction: directionMap[x.direction],
                sender: x.sender,
                recipient: x.recipient,
                amount: isGte(x.quantity.int, MaxUint256) ? 'unlimited' : x.quantity.numeric,
            }
        }
        return null
    })
    const approvalAssets = attrs.approvals.map((x): TransactionAsset<ChainId, SchemaType> | null => {
        const implement = x.fungible_info?.implementations.find((x) => x.chain_id === zerionChainId)
        if (!x.fungible_info) return null
        const amount =
            isGte(x.quantity.int, MaxUint256) ? 'unlimited' : formatAmount(x.quantity.int, -x.quantity.decimals)

        return {
            id: x.fungible_info.symbol,
            type: TokenType.Fungible,
            schema: implement?.address ? SchemaType.ERC20 : SchemaType.Native,
            chainId,
            name: x.fungible_info.name,
            symbol: x.fungible_info.symbol,
            address: implement!.address!,
            direction: 'send',
            amount,
            sender: attrs.sent_from,
            recipient: implement?.address,
        }
    })
    return {
        id: transaction.id,
        hash: transaction.attributes.hash,
        chainId,
        type: attrs.operation_type,
        cateType: undefined,
        from: attrs.sent_from,
        to: attrs.sent_to,
        timestamp: new Date(attrs.mined_at).getTime(),
        status: statusMap[attrs.status],
        assets: compact(assets),
        approveAssets: compact(approvalAssets),
        isScam: transaction.attributes.flags?.is_trash,
        fee: {
            native: transaction.attributes.fee.quantity.numeric,
        },
        feeInfo: {
            name: attrs.fee.fungible_info?.name,
            symbol: attrs.fee.fungible_info?.symbol,
            icon: attrs.fee.fungible_info?.icon?.url || undefined,
            amount: attrs.fee.quantity.numeric,
            price: attrs.fee.price,
            value: attrs.fee.value,
        },
    }
}

export const zerionChainIdResolver = createLookupTableResolver<string, ChainId | undefined>(
    {
        // cspell: ignore taiko,opbnb,degen,okbchain
        arbitrum: ChainId.Arbitrum,
        aurora: ChainId.Aurora,
        avalanche: ChainId.Avalanche,
        base: ChainId.Base,
        'binance-smart-chain': ChainId.BSC,
        celo: ChainId.Celo,
        ethereum: ChainId.Mainnet,
        fantom: ChainId.Fantom,
        okbchain: ChainId.XLayer,
        optimism: ChainId.Optimism,
        polygon: ChainId.Polygon,
        scroll: ChainId.Scroll,
        xdai: ChainId.xDai,
        zora: ChainId.Zora,
        // unused chains
        // 'meta-pacific': ChainId.MetaPacific
        // 'zksync-ara':ChainId.ZKSyncEra
        // blast: ChainId.Blast
        // cyber: ChainId.Cyber
        // degen: ChainId.Degen,
        // linea: ChainId.Linea
        // mantle: ChainId.Mantle
        // metis-andromeda: ChainId.MetisAndromeda
        // mode: ChainId.Mode
        // opbnb:ChainId.opBNB
        // taiko: ChainId.WorldChain,
    },
    () => undefined,
)
