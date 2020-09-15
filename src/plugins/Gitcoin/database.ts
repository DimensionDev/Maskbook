import { BigNumber } from 'bignumber.js'
import { walletAPI, erc20API } from '../Wallet/api'
import { gitcoinAPI } from './contracts'
import type { GitcoinDonationPayload, GitcoinDonationRecord } from './types'
import { PluginMessageCenter } from '../PluginMessages'
import type { _UnboxPromise } from 'async-call-rpc/full'
import { getChainId } from '../../extension/background-script/EthereumService'
import { EthereumTokenType } from '../../web3/types'
import { getAllConstants } from '../../web3/helpers'
import { GITCOIN_CONSTANT } from './constants'

function getProvider() {
    return {
        ...gitcoinAPI,
        ...walletAPI,
        ...erc20API,
    }
}

export async function donateGrant(donation: GitcoinDonationPayload) {
    const chainId = await getChainId()
    const { GITCOIN_MAINTAINER_ADDRESS, BULK_CHECKOUT_ADDRESS } = getAllConstants(GITCOIN_CONSTANT, chainId)
    const { donor_address, donation_address, donation_total, token, token_type } = donation

    let approved: _UnboxPromise<ReturnType<typeof erc20API.approve>> | undefined

    // approve splitter contract for spending erc20 token
    if (token_type === EthereumTokenType.ERC20) {
        approved = await getProvider().approve(
            donor_address,
            BULK_CHECKOUT_ADDRESS,
            token?.address!,
            new BigNumber(donation_total),
        )
    }

    // donate
    const donated = await getProvider().donate(
        donor_address,
        GITCOIN_MAINTAINER_ADDRESS,
        donation_address,
        donation_total,
        token?.address,
    )

    const record: GitcoinDonationRecord = {
        donor_address,
        donation_address,
        donation_total,
        chainId,
        token_type,
        erc20_token: token?.address,
        ...approved,
        ...donated,
    }
    PluginMessageCenter.emit('maskbook.gitcoin.update', undefined)
    return record
}
