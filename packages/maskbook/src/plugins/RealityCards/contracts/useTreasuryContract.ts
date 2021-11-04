import type { AbiItem } from 'web3-utils'
import RealityCardsTreasuryABI from '@masknet/web3-contracts/abis/RealityCardsTreasury.json'
import type { RealityCards } from '@masknet/web3-contracts/types/RealityCardsTreasury'
import { useContract, useRealityCardsConstants } from '@masknet/web3-shared-evm'

export function useTreasuryContract() {
    const { REALITY_CARD_ADDRESS } = useRealityCardsConstants()
    return useContract<RealityCards>(REALITY_CARD_ADDRESS, RealityCardsTreasuryABI as AbiItem[])
}
