import { useBlockie } from '@masknet/web3-shared-evm'
import { BLOCKIES_OPTIONS } from '../constants'

export function useAvatar(address: string) {
    return useBlockie(address, BLOCKIES_OPTIONS)
}
