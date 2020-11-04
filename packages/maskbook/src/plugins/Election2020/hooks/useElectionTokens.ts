import { hexToNumberString, soliditySha3 } from 'web3-utils'
import type { ElectionToken, US_STATE_TYPE } from '../types'
import ELECTION_STATE_VS_VOTES from '../election.json'
import { resolveStateType } from '../pipes'
import type { ERC721Token } from '../../../web3/types'

export function useElectionTokens(stateType: US_STATE_TYPE, token?: ERC721Token): ElectionToken[] {
    const state = ELECTION_STATE_VS_VOTES.find((x) => x.state_id === stateType)
    if (!state) return []
    if (!token) return []
    return new Array(state.votes).fill(0).map((_, idx) => {
        const id = state.votes - idx - 1
        const tokenId_ = soliditySha3({ t: 'uint8', v: resolveStateType(stateType) }, { t: 'uint8', v: id })
        const tokenId = tokenId_ ? hexToNumberString(tokenId_) : ''
        return {
            tokenId,
            tokenImageURL: tokenId ? `${token.baseURI}${tokenId}.gif` : '',
        }
    })
}
