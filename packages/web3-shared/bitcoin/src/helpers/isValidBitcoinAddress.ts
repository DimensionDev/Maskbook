import { isArrayBufferEqual } from '@masknet/kit'
import { sha3 } from 'web3-utils'

export function isValidBitcoinAddress(address?: string): address is string {
    try {
        if (!address) return false

        // Step 1: Decode the base58 address
        const decodedAddress = Buffer.from(address, 'base64')

        // Step 2: Verify the checksum
        const checksum = decodedAddress.slice(-4)
        const addressWithoutChecksum = decodedAddress.slice(0, -4)

        // Calculate the hash using web3.js
        const addressHash = sha3(addressWithoutChecksum)
        if (!addressHash) return false

        // Convert the web3.js hash to Uint8Array
        const addressHashArray = new Uint8Array(Buffer.from(addressHash.slice(2), 'hex'))

        // Calculate the checksum from the hash
        const calculatedChecksum = addressHashArray.slice(0, 4)

        if (!isArrayBufferEqual(checksum, calculatedChecksum)) {
            return false
        }

        // Step 3: Check the version bytes
        const versionBytes = decodedAddress.slice(0, 1)
        return (
            isArrayBufferEqual(versionBytes, new Uint8Array([0x00])) ||
            isArrayBufferEqual(versionBytes, new Uint8Array([0x05])) ||
            isArrayBufferEqual(versionBytes, new Uint8Array([0x6f]))
        )
    } catch (error) {
        return false
    }
}
