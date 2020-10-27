import type { ElectionToken, US_STATE_TYPE } from '../types'
import ELECTION_STATE_VS_VOTES from '../election.json'
import { useERC721TokenIdsOfOwner } from '../../../web3/hooks/useERC721TokensOfOwner'
import type { ERC721Token } from '../../../web3/types'
import { useElectionTokens } from './useElectionTokens'

export function useElectionTokensOfOwner(stateType: US_STATE_TYPE, token?: ERC721Token) {
    const state = ELECTION_STATE_VS_VOTES.find((x) => x.state_id === stateType)
    const { value: tokenIds, ...result } = useERC721TokenIdsOfOwner(token)
    const totalTokens = useElectionTokens(stateType, token)

    if (!state || !token || !totalTokens.length)
        return {
            ...result,
            value: [],
        }
    return {
        ...result,
        value: totalTokens.filter((x) => tokenIds.includes(x.tokenId)),
    }
}
