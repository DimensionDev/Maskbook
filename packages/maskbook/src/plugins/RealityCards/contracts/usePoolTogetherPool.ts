import type { AbiItem } from 'web3-utils'
import RealityCardsABI from '@masknet/web3-contracts/abis/RealityCards.json'
import type { RealityCards } from '@masknet/web3-contracts/types/RealityCards'
import { useContract, useRealityCardsConstants } from '@masknet/web3-shared-evm'

export function useRealityCardsContract() {
    const { REALITY_CARD_ADDRESS } = useRealityCardsConstants()
    return useContract<RealityCards>(REALITY_CARD_ADDRESS, RealityCardsABI as AbiItem[])
}
