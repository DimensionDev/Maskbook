import type { AbiItem } from 'web3-utils'
import type { ElectionToken } from '../../../contracts/election-token/ElectionToken'
import ElectionTokenABI from '../../../contracts/election-token/ElectionToken.json'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useContract } from '../../../web3/hooks/useContract'
import { ELECTION_2020_CONSTANTS } from '../constants'

export function useElectionTokenContract() {
    const address = useConstant(ELECTION_2020_CONSTANTS, 'ELECTION_TOKEN_ADDRESS')
    return useContract<ElectionToken>(address, ElectionTokenABI as AbiItem[])
}
