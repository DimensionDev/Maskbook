import { keccak256, sha3, toChecksumAddress } from 'web3-utils'

export function getCreate2Address(fromAddress: string, salt: string, initCode: string): string {
    const create2Inputs = [
        '0xff',
        fromAddress,
        keccak256(salt), // salt needs to be 32 bytes
        keccak256(initCode),
    ]
    const create2AddressHex = sha3(create2Inputs.join(''))!.slice(-40)
    return toChecksumAddress('0x' + create2AddressHex)
}
