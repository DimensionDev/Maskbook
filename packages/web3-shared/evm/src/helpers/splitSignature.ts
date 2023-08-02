import { utils } from 'ethers'

export function splitSignature(signature: string) {
    return utils.splitSignature(signature)
}
