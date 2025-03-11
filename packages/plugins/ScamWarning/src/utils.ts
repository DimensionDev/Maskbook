import { EVM_ADDRESS, SOLANA_ADDRESS } from '@masknet/plugin-scam-warning'
import { EXIST_EVM_ADDRESS, EXIST_SOLANA_ADDRESS, EXIST_TRON_ADDRESS, TRON_ADDRESS } from './constants.js'

export function isTronAddress(address: string) {
    return !!address.match(address)
}

export function extractAddresses(text: string, exist = false) {
    const evmAddresses = text.match(exist ? EXIST_EVM_ADDRESS : EVM_ADDRESS) || []
    const solAddresses = text.match(exist ? EXIST_SOLANA_ADDRESS : SOLANA_ADDRESS) || []
    const tronAddresses = text.match(exist ? EXIST_TRON_ADDRESS : TRON_ADDRESS) || []
    return [...evmAddresses, ...solAddresses, ...tronAddresses]
}
