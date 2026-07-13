import type { ChainId } from '../types/index.js'
import { ChainIdList } from '../constants/constants.js'

export function isValidChainId(chainId?: ChainId): chainId is ChainId {
    // TODO custom networks
    return ChainIdList.includes(chainId!)
}
