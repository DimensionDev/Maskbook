import { isZeroAddress } from '@masknet/web3-shared-evm'

export function convertNativeAddress(address: string) {
    if (isZeroAddress(address)) return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    return address
}
