import { createLookupTableResolver } from '@masknet/shared-base'
import {
    isGte,
    toFixed,
    TokenType,
    type Transaction,
    type TransactionAsset,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { ChainId, formatAmount, SchemaType } from '@masknet/web3-shared-evm'
import { compact } from 'lodash-es'
import type { Transaction as RestTransaction } from './reset-types.js'

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
        // cspell: ignore okbchain
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
    },
    () => {
        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined
    },
)
