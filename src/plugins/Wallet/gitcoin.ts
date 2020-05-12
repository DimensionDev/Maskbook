import type { BigNumber } from 'bignumber.js'
import { gitcoinAPI } from './real'
import type { GitcoinFundRecord } from './database/types'

function getProvider() {
    return gitcoinAPI
}

export function fundGrant(
    fund: Pick<
        GitcoinFundRecord,
        'donor_address' | 'donation_address' | 'donation_total' | 'network' | 'token_type' | 'erc20_token' | 'comment'
    >,
) {
    // TODO:
    // getProvider().fund()
    return Promise.resolve({})
}
