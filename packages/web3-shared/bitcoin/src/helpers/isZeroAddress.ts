import { isSameAddress } from '@masknet/web3-shared-base'
import { ZERO_ADDRESS } from '../constants/index.js'

export function isZeroAddress(address: string) {
    return isSameAddress(address, ZERO_ADDRESS)
}
