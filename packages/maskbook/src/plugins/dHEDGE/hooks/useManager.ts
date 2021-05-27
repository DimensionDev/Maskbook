import { useBlockie } from '@dimensiondev/web3-shared'
import { BLOCKIES_OPTIONS } from '../constants'

export function useAvatar(address: string) {
    return useBlockie(address, BLOCKIES_OPTIONS)
}
