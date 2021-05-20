import { useBlockie } from '../../../web3/hooks/useBlockie'
import { BLOCKIES_OPTIONS } from '../constants'

export function useAvatar(address: string) {
    return useBlockie(address, BLOCKIES_OPTIONS)
}
