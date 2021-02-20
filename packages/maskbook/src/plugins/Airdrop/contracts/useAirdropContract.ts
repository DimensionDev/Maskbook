import { useConstant } from '../../../web3/hooks/useConstant'
import { useContract } from '../../../web3/hooks/useContract'
import { AIRDROP_CONSTANTS } from '../constants'

export function useAirdropContract() {
    const address = useConstant(AIRDROP_CONSTANTS, 'AIRDROP_CONTRACT_ADDRESS')
    return useContract<any>(address, [])
}
