import { useBlockie } from '@masknet/plugin-infra/web3'
import { BLOCKIES_OPTIONS } from '../constants'

export function useAvatar(address: string) {
    return useBlockie(address, BLOCKIES_OPTIONS)
}
