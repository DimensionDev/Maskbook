import { EthereumAddress } from 'wallet.ts'

export function checksumAddress(address: string) {
    return address && EthereumAddress.isValid(address) ? EthereumAddress.checksumAddress(address) : address
}
