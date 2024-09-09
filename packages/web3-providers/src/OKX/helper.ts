import { isZeroAddress } from '@masknet/web3-shared-evm'

export function convertNativeAddress(address: string) {
    if (isZeroAddress(address)) return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    return address
}

export function normalizeCode<T extends { code: number }>(res: T): T {
    return {
        ...res,
        code: Number.parseInt(res.code as unknown as string, 10),
    }
}
