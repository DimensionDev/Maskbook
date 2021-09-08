import type { AbiItem } from 'web3-utils'
import ShoyuDutchAuctionABI from '@masknet/web3-contracts/abis/ShoyuDutchAuction.json'
import ShoyuEnglishAuctionABI from '@masknet/web3-contracts/abis/ShoyuEnglishAuction.json'
import ShoyuTokenFactoryABI from '@masknet/web3-contracts/abis/ShoyuTokenFactory.json'
import ShoyuERC721ExchangeV0ABI from '@masknet/web3-contracts/abis/ShoyuERC721ExchangeV0.json'
import ShoyuERC1155ExchangeV0ABI from '@masknet/web3-contracts/abis/ShoyuERC1155ExchangeV0.json'
import ShoyuFixedPriceSaleABI from '@masknet/web3-contracts/abis/ShoyuFixedPriceSale.json'
import ShoyuPaymentSplitterFactoryABI from '@masknet/web3-contracts/abis/ShoyuFixedPriceSale.json'

import type { ShoyuDutchAuction } from '@masknet/web3-contracts/types/ShoyuDutchAuction'
import type { ShoyuEnglishAuction } from '@masknet/web3-contracts/types/ShoyuEnglishAuction'
import type { ShoyuTokenFactory } from '@masknet/web3-contracts/types/ShoyuTokenFactory'
import type { ShoyuERC721ExchangeV0 } from '@masknet/web3-contracts/types/ShoyuERC721ExchangeV0'
import type { ShoyuERC1155ExchangeV0 } from '@masknet/web3-contracts/types/ShoyuERC1155ExchangeV0'
import type { ShoyuFixedPriceSale } from '@masknet/web3-contracts/types/ShoyuFixedPriceSale'
import type { ShoyuPaymentSplitterFactory } from '@masknet/web3-contracts/types/ShoyuPaymentSplitterFactory'

import { useContract } from '@masknet/web3-shared'

export function useShoyuDutchAuctionContract(address?: string) {
    return useContract<ShoyuDutchAuction>(address, ShoyuDutchAuctionABI as AbiItem[])
}

export function useShoyuTokenFactoryContract(address?: string) {
    return useContract<ShoyuTokenFactory>(address, ShoyuTokenFactoryABI as AbiItem[])
}

export function useShoyuEnglishAuctionContract(address?: string) {
    return useContract<ShoyuEnglishAuction>(address, ShoyuEnglishAuctionABI as AbiItem[])
}

export function useShoyuERC721ExchangeV0Contract(address?: string) {
    return useContract<ShoyuERC721ExchangeV0>(address, ShoyuERC721ExchangeV0ABI as AbiItem[])
}

export function useShoyuERC1155ExchangeV0Contract(address?: string) {
    return useContract<ShoyuERC1155ExchangeV0>(address, ShoyuERC1155ExchangeV0ABI as AbiItem[])
}

export function useShoyuFixedPriceSaleContract(address?: string) {
    return useContract<ShoyuFixedPriceSale>(address, ShoyuFixedPriceSaleABI as AbiItem[])
}

export function useShoyuPaymentSplitterFactoryContract(address?: string) {
    return useContract<ShoyuPaymentSplitterFactory>(address, ShoyuPaymentSplitterFactoryABI as AbiItem[])
}
