import { encode } from 'bs58'
import { sha3 } from 'web3-utils'

export function formatBitcoinAddress(address: string): string {
    // Step 1: Decode the base58 address
    const decodedAddress = Buffer.from(address, 'base64')

    // Step 2: Hash the address
    const addressHash = sha3(decodedAddress)
    if (!addressHash) return address

    // Step 3: Calculate the checksum
    const checksum = Buffer.from(addressHash.slice(2, 10), 'hex')

    // Step 4: Append the checksum to the original address
    const addressWithChecksum = Buffer.concat([decodedAddress, checksum])

    // Step 5: Encode the address (with the appended checksum) in Base58
    return encode(addressWithChecksum)
}
