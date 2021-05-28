import type { AbiItem } from 'web3-utils'
import type { Airdrop } from '@dimensiondev/contracts/types/Airdrop'
import { AIRDROP_CONSTANTS } from '../constants'
import AirdropABI from '@dimensiondev/contracts/abis/Airdrop.json'
import { useConstant, useContract } from '@dimensiondev/web3-shared'

export function useAirdropContract() {
    const address = useConstant(AIRDROP_CONSTANTS, 'AIRDROP_CONTRACT_ADDRESS')
    return useContract<Airdrop>(address, AirdropABI as AbiItem[])
}
