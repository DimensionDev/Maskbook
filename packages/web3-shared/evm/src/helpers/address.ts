import { memoize } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    ChainIdList,
    getArbConstants,
    getCryptoPunksConstants,
    getENSConstants,
    getLensProfileConstants,
    getRedPacketConstants,
    getSpaceIdConstants,
    getTokenConstant,
    ZERO_ADDRESS,
} from '../constants/index.js'
import { ChainId } from '../types/index.js'

export function checksumAddress(address: string) {
    return web3_utils.toChecksumAddress(address)
}

export function isEmptyHex(hex?: string): hex is undefined {
    return !hex || ['0x', '0x0'].includes(hex)
}

export function isZeroString(str?: string): str is undefined {
    return !str || str === '0'
}

export const isValidAddress: (address?: string) => address is string = memoize(function isValidAddress(
    address?: string,
): address is string {
    if (!address) return false
    return web3_utils.isAddress(address)
})

export function isZeroAddress(address?: string): address is '0x0000000000000000000000000000000000000000' {
    return isSameAddress(address, ZERO_ADDRESS)
}

const nativeTokenSet = new Set(ChainIdList.map((chainId) => getTokenConstant(chainId, 'NATIVE_TOKEN_ADDRESS')))

export function isNativeTokenAddress(address?: string): address is string {
    if (!address) return false
    return nativeTokenSet.has(address)
}

const {
    HAPPY_RED_PACKET_ADDRESS_V1,
    HAPPY_RED_PACKET_ADDRESS_V2,
    HAPPY_RED_PACKET_ADDRESS_V3,
    HAPPY_RED_PACKET_ADDRESS_V4,
} = getRedPacketConstants()

export function isRedPacketAddress(address: string, version?: 1 | 2 | 3 | 4) {
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

export function getZeroAddress() {
    return ZERO_ADDRESS
}

export const getNativeTokenAddress: (chainId: ChainId) => string = memoize((chainId = ChainId.Mainnet) => {
    return getTokenConstant(chainId, 'NATIVE_TOKEN_ADDRESS') ?? ZERO_ADDRESS
})

export const getMaskTokenAddress: (chainId: ChainId) => string = memoize((chainId = ChainId.Mainnet) => {
    return getTokenConstant(chainId, 'MASK_ADDRESS') ?? ''
})

const { ENS_CONTRACT_ADDRESS } = getENSConstants()
export function isENSContractAddress(contract_address: string) {
    return isSameAddress(contract_address, ENS_CONTRACT_ADDRESS)
}

const { ENS_NAME_WRAPPER_CONTRACT_ADDRESS } = getENSConstants()
export function isENSNameWrapperContractAddress(contract_address: string) {
    return isSameAddress(contract_address, ENS_NAME_WRAPPER_CONTRACT_ADDRESS)
}

export function isLensProfileAddress(address: string) {
    const { LENS_PROFILE_CONTRACT_ADDRESS } = getLensProfileConstants(ChainId.Polygon)
    return isSameAddress(address, LENS_PROFILE_CONTRACT_ADDRESS)
}

const { ARB_CONTRACT_ADDRESS } = getArbConstants(ChainId.Arbitrum)
export function isArbContractAddress(contract_address: string) {
    return isSameAddress(contract_address, ARB_CONTRACT_ADDRESS)
}

const { SID_CONTRACT_ADDRESS } = getSpaceIdConstants(ChainId.BSC)
export function isSpaceIdContractAddress(contract_address: string) {
    return isSameAddress(contract_address, SID_CONTRACT_ADDRESS)
}

export function isXnsContractAddress(address: string) {
    return isENSContractAddress(address) || isArbContractAddress(address) || isSpaceIdContractAddress(address)
}

export function isCryptoPunksContractAddress(contract_address: string) {
    const { CRYPTOPUNKS_CONTRACT_ADDRESS } = getCryptoPunksConstants()
    return isSameAddress(contract_address, CRYPTOPUNKS_CONTRACT_ADDRESS)
}
