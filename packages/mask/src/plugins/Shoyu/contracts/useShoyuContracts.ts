import { useContract, useShoyuConstants } from '@masknet/web3-shared-evm'
import ShoyuERC721ExchangeAbi from '@masknet/web3-contracts/abis/ERC721Exchange.json'
import ShoyuERC1155ExchangeAbi from '@masknet/web3-contracts/abis/ERC1155Exchange.json'
import ShoyuTokenFactoryAbi from '@masknet/web3-contracts/abis/ShoyuTokenFactory.json'
import PaymentSplitterFactoryAbi from '@masknet/web3-contracts/abis/PaymentSplitterFactory.json'
import FixedPriceSaleAbi from '@masknet/web3-contracts/abis/FixedPriceSale.json'
import EnglishAuctionAbi from '@masknet/web3-contracts/abis/EnglishAuction.json'
import DutchAuctionAbi from '@masknet/web3-contracts/abis/DutchAuction.json'
import type { DutchAuction } from '@masknet/web3-contracts/types/DutchAuction'
import type { EnglishAuction } from '@masknet/web3-contracts/types/EnglishAuction'
import type { ShoyuTokenFactory } from '@masknet/web3-contracts/types/ShoyuTokenFactory'
import type { ERC1155Exchange } from '@masknet/web3-contracts/types/ERC1155Exchange'
import type { ERC721Exchange } from '@masknet/web3-contracts/types/ERC721Exchange'
import type { PaymentSplitterFactory } from '@masknet/web3-contracts/types/PaymentSplitterFactory'
import type { FixedPriceSale } from '@masknet/web3-contracts/types/FixedPriceSale'
import type { AbiItem } from 'web3-utils'

export function useShoyuERC721ExchangeContract() {
    const { SHOYU_ERC721_EXCHANGE } = useShoyuConstants()
    return useContract<ERC721Exchange>(SHOYU_ERC721_EXCHANGE, ShoyuERC721ExchangeAbi as AbiItem[])
}

export function useShoyuERC1155ExchangeContract() {
    const { SHOYU_ERC1155_EXCHANGE } = useShoyuConstants()
    return useContract<ERC1155Exchange>(SHOYU_ERC1155_EXCHANGE, ShoyuERC1155ExchangeAbi as AbiItem[])
}

export function useShoyuTokenFactoryContract() {
    const { SHOYU_TOKEN_FACTORY } = useShoyuConstants()
    return useContract<ShoyuTokenFactory>(SHOYU_TOKEN_FACTORY, ShoyuTokenFactoryAbi as AbiItem[])
}

export function useShoyuDutchAuctionContract() {
    const { SHOYU_DUTCH_AUCTION_EXCHANGE } = useShoyuConstants()
    return useContract<DutchAuction>(SHOYU_DUTCH_AUCTION_EXCHANGE, DutchAuctionAbi as AbiItem[])
}

export function useShoyuEnglishAuctionContract() {
    const { SHOYU_ENGLISH_AUCTION_EXCHANGE } = useShoyuConstants()
    return useContract<EnglishAuction>(SHOYU_ENGLISH_AUCTION_EXCHANGE, EnglishAuctionAbi as AbiItem[])
}

export function useShoyuPaymentSplitterFactoryContract() {
    const { SHOYU_PAYMENT_SPLITTER_FACTORY } = useShoyuConstants()
    return useContract<PaymentSplitterFactory>(SHOYU_PAYMENT_SPLITTER_FACTORY, PaymentSplitterFactoryAbi as AbiItem[])
}

export function useShoyuFixedPriceSaleContract() {
    const { SHOYU_FIXED_PRICE_SALE } = useShoyuConstants()
    return useContract<FixedPriceSale>(SHOYU_FIXED_PRICE_SALE, FixedPriceSaleAbi as AbiItem[])
}
