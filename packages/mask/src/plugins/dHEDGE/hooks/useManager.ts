import { useBlockie } from '@masknet/web3-hooks-base'
import { BLOCKIES_OPTIONS } from '../constants.js'

export function useAvatar(address: string) {
    return useBlockie(address, BLOCKIES_OPTIONS)
}
