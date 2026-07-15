import {
    MATCH_EVM_ADDRESS_RE,
    MATCH_SOLANA_ADDRESS_RE,
    MATCH_TRON_ADDRESS_RE,
    TRON_ADDRESS_RE,
    SOLANA_ADDRESS_RE,
    EVM_ADDRESS_RE,
} from '@masknet/shared-base'

export function isTronAddress(address: string) {
    return !!TRON_ADDRESS_RE.test(address)
}

export function extractAddresses(text: string, exist = false) {
    const evmAddresses = text.match(exist ? MATCH_EVM_ADDRESS_RE : EVM_ADDRESS_RE) || []
    const solAddresses = text.match(exist ? MATCH_SOLANA_ADDRESS_RE : SOLANA_ADDRESS_RE) || []
    const tronAddresses = text.match(exist ? MATCH_TRON_ADDRESS_RE : TRON_ADDRESS_RE) || []
    return [...evmAddresses, ...solAddresses, ...tronAddresses].map((x) => x.trim())
}
