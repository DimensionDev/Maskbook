import { CANDIDATE_TYPE, US_PARTY_TYPE, US_STATE_TYPE } from './types'
import ELECTION_STATE_VS_VOTES from './election.json'

export function resolveCandidateName(candidateType: CANDIDATE_TYPE) {
    if (candidateType === CANDIDATE_TYPE.TRUMP) return 'Donald Trump'
    return 'Joe Biden'
}

export function resolveCandidateBriefName(candidateType: CANDIDATE_TYPE) {
    if (candidateType === CANDIDATE_TYPE.TRUMP) return 'Trump'
    return 'Biden'
}

export function resolveCandiateType(candidateType: CANDIDATE_TYPE) {
    if (candidateType === CANDIDATE_TYPE.TRUMP) return 0
    return 1
}

export function resolveCandidateSNSAccount(network: string, candidateType: CANDIDATE_TYPE) {
    switch (network) {
        case 'twitter.com':
            return candidateType === CANDIDATE_TYPE.TRUMP ? 'realDonaldTrump' : 'JoeBiden'
        case 'facebook.com':
            return ''
        default:
            return ''
    }
}

export function resolveCandidatePartyType(candidateType: CANDIDATE_TYPE) {
    if (candidateType === CANDIDATE_TYPE.TRUMP) return US_PARTY_TYPE.RED
    return US_PARTY_TYPE.BLUE
}

export function resolveStateName(stateType: US_STATE_TYPE) {
    const state = ELECTION_STATE_VS_VOTES.find((x) => x.state_id === stateType)
    return state?.state_name ?? stateType
}

export function resolveStateType(stateType: US_STATE_TYPE) {
    const state = ELECTION_STATE_VS_VOTES.find((x) => x.state_id === stateType)
    return state?.state_type ?? 0
}
