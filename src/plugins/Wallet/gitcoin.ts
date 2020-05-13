import type { BigNumber } from 'bignumber.js'
import { gitcoinAPI } from './api'
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
    // split amount

    // if (eth) {
    //     transfer
    // } else {
    //     approve ERC20
    //     split transfer
    // }

    // TODO:
    // getProvider().fund()
    return Promise.resolve({})
}
