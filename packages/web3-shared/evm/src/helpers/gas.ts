import { hexToBytes } from 'web3-utils'

export function calcuateDataCost(data: string): number {
    return hexToBytes(data)
        .map<number>((x) => (x === 0 ? 4 : 16))
        .reduce((sum, x) => sum + x)
}
