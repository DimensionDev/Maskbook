// This version has been skillfully assembled by incorporating elements from previous projects,
// while also making efficient use of libraries that are already integrated into the current project.
// Learn more:
// https://github.com/ruigomeseu/bitcoin-address-validation
// https://github.com/ryanralph/altcoin-address

import base58 from 'bs58'
import { sha256 } from 'js-sha256'
import { bech32, bech32m } from 'bech32'

export enum BitcoinAddressType {
    P2PKH = 'P2PKH', // Old address
    P2SH = 'P2SH', // Pay to Script Hash
    P2WPKH = 'P2WPKH', // Segregated Witness Native
    P2TR = 'P2TR', // Taproot
}

export enum ProtocolType {
    Bitcoin = 'bitcoin',
    BitcoinTestnet = 'bitcoin_testnet',
    Dogecoin = 'dogecoin',
    DogecoinTestnet = 'dogecoin_testnet',
}

const P2SHTypes: Record<string, string> = {
    [ProtocolType.Bitcoin]: '05', //  5 Decimal 3 prefix
    [ProtocolType.BitcoinTestnet]: 'c4', // 196 Decimal 2 prefix
    [ProtocolType.Dogecoin]: '16', //22 Decimal 9A prefix
    [ProtocolType.DogecoinTestnet]: 'c4', // 196 Decimal 2 prefix
}

const P2PKHTypes: Record<string, string> = {
    [ProtocolType.Bitcoin]: '00', //  0 Decimal 1 prefix
    [ProtocolType.BitcoinTestnet]: '6f', // 111 Decimal mn prefix
    [ProtocolType.Dogecoin]: '1e', // 30 Decimal D prefix
    [ProtocolType.DogecoinTestnet]: '71', // 113 Decimal n prefix
}

const Bech32Types: Record<string, string> = {
    [ProtocolType.Bitcoin]: 'bc',
    [ProtocolType.BitcoinTestnet]: 'tb',
}

export function deocdeBase58Address(type: ProtocolType, address: string) {
    try {
        const decoded = Buffer.from(base58.decode(address))
        const length = decoded.length

        // should be 25 bytes per btc address spec
        if (length != 25) return

        const checksum = decoded.slice(length - 4, length).toString('binary')
        const body = decoded.slice(0, length - 4)

        const sha3_once = sha256(body)
        const sha3_twice = sha256(new Buffer(sha3_once, 'hex'))

        const validChecksum = new Buffer(sha3_twice, 'hex').toString('binary').substr(0, 4)
        if (checksum !== validChecksum) return

        const prefix = decoded.toString('hex').slice(0, 2)
        if (prefix === P2SHTypes[type]) return BitcoinAddressType.P2SH
        if (prefix === P2PKHTypes[type]) return BitcoinAddressType.P2PKH
        return
    } catch (error) {
        return
    }
}

export function decodeBech32Address(type: ProtocolType, address?: string) {
    if (!address) return

    try {
        const { prefix, words } =
            address.startsWith('bc1p') || address.startsWith('tb1p') || address.startsWith('bcrt1p')
                ? bech32m.decode(address)
                : bech32.decode(address)

        if (prefix !== Bech32Types[type]) return false

        const witnessVersion = words[0]
        if (witnessVersion < 0 || witnessVersion > 16) return

        const data = bech32.fromWords(words.slice(1))

        if (data.length === 20) return BitcoinAddressType.P2WPKH
        else if (witnessVersion === 1) return BitcoinAddressType.P2TR
        else return BitcoinAddressType.P2WPKH
    } catch {
        return
    }
}
