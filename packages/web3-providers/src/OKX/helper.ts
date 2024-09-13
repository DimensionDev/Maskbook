import { isZeroAddress } from '@masknet/web3-shared-evm'

export function toOkxNativeAddress(address: string) {
    if (isZeroAddress(address)) return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    return address
}

export function fromOkxNativeAddress(address: string) {
    if (address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') return '0x0000000000000000000000000000000000000000'
    return address
}

export function normalizeCode<T extends { code: number }>(res: T): T {
    return {
        ...res,
        code: Number.parseInt(res.code as unknown as string, 10),
    }
}
