import type { ChainId } from '../types'
import { getAuthConstants } from '../constants'

export function createClient(chainId: ChainId) {
    const authConstants = getAuthConstants(chainId)

    return {}
}
