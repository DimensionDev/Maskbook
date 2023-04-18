import { EthereumAddress } from 'wallet.ts'
import { getEnumAsArray } from '@masknet/kit'
import { isPopupPage } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    getArbConstants,
    getCryptoPunksConstants,
    getENSConstants,
    getRedPacketConstants,
    getSpaceIdConstants,
    getTokenConstant,
    ZERO_ADDRESS,
} from '../constants/index.js'
import { ChainId, NetworkType, ProviderType } from '../types/index.js'

export function isEmptyHex(hex?: string): hex is undefined {
    return !hex || ['0x', '0x0'].includes(hex)
}

export function isZeroString(str?: string): str is undefined {
    return !str || str === '0'
}

export function isValidAddress(address?: string): address is string {
    if (!address) return false
    return EthereumAddress.isValid(address)
}

export function isValidChainId(chainId?: ChainId): chainId is ChainId {
    return getEnumAsArray(ChainId).some((x) => x.value === chainId)
}

export function isZeroAddress(address?: string): address is string {
    return isSameAddress(address, ZERO_ADDRESS)
}

export function isNativeTokenAddress(address?: string): address is string {
    const set = new Set(getEnumAsArray(ChainId).map((x) => getTokenConstant(x.value, 'NATIVE_TOKEN_ADDRESS')))
    return !!(address && set.has(address))
}

export function isRedPacketAddress(address: string, version?: 1 | 2 | 3 | 4) {
    const {
        HAPPY_RED_PACKET_ADDRESS_V1,
        HAPPY_RED_PACKET_ADDRESS_V2,
        HAPPY_RED_PACKET_ADDRESS_V3,
        HAPPY_RED_PACKET_ADDRESS_V4,
    } = getRedPacketConstants()

    switch (version) {
        case 1:
            return isSameAddress(HAPPY_RED_PACKET_ADDRESS_V1, address)
        case 2:
            return isSameAddress(HAPPY_RED_PACKET_ADDRESS_V2, address)
        case 3:
            return isSameAddress(HAPPY_RED_PACKET_ADDRESS_V3, address)
        case 4:
            return isSameAddress(HAPPY_RED_PACKET_ADDRESS_V4, address)
        default:
            return (
                isSameAddress(HAPPY_RED_PACKET_ADDRESS_V1, address) ||
                isSameAddress(HAPPY_RED_PACKET_ADDRESS_V2, address) ||
                isSameAddress(HAPPY_RED_PACKET_ADDRESS_V3, address) ||
                isSameAddress(HAPPY_RED_PACKET_ADDRESS_V4, address)
            )
    }
}

export function getDefaultChainId() {
    return ChainId.Mainnet
}

export function getInvalidChainId() {
    return ChainId.Invalid
}

export function getDefaultNetworkType() {
    return NetworkType.Ethereum
}

export function getDefaultProviderType() {
    return isPopupPage() ? ProviderType.MaskWallet : ProviderType.None
}

export function getZeroAddress() {
    return ZERO_ADDRESS
}

export function getNativeTokenAddress(chainId = ChainId.Mainnet) {
    return getTokenConstant(chainId, 'NATIVE_TOKEN_ADDRESS') ?? ''
}

export function getMaskTokenAddress(chainId = ChainId.Mainnet) {
    return getTokenConstant(chainId, 'MASK_ADDRESS') ?? ''
}

export function isENSContractAddress(contract_address: string) {
    const { ENS_CONTRACT_ADDRESS } = getENSConstants()
    return isSameAddress(contract_address, ENS_CONTRACT_ADDRESS)
}

export function isArbContractAddress(contract_address: string) {
    const { ARB_CONTRACT_ADDRESS } = getArbConstants(ChainId.Arbitrum)
    return isSameAddress(contract_address, ARB_CONTRACT_ADDRESS)
}

export function isSpaceIdContractAddress(contract_address: string) {
    const { SID_CONTRACT_ADDRESS } = getSpaceIdConstants(ChainId.BSC)
    return isSameAddress(contract_address, SID_CONTRACT_ADDRESS)
}

export function isXnsContractAddress(address: string) {
    return isENSContractAddress(address) || isArbContractAddress(address) || isSpaceIdContractAddress(address)
}

export function isCryptoPunksContractAddress(contract_address: string) {
    const { CRYPTOPUNKS_CONTRACT_ADDRESS } = getCryptoPunksConstants()
    return isSameAddress(contract_address, CRYPTOPUNKS_CONTRACT_ADDRESS)
}
