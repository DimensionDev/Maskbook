import { BigNumber } from 'bignumber.js'
import { gitcoinAPI, walletAPI } from './api'
import { GitcoinDonationPayload, GitcoinDonationRecord, EthereumTokenType } from './database/types'
import { getNetworkSettings } from './UI/Developer/SelectEthereumNetwork'
import { PluginMessageCenter } from '../PluginMessages'
import type { _UnboxPromise } from '@holoflows/kit/node_modules/async-call-rpc'

function getProvider() {
    return {
        ...gitcoinAPI,
        ...walletAPI,
    }
}

export async function donateGrant(donation: GitcoinDonationPayload) {
    const { networkType, gitcoinDonationAddress } = getNetworkSettings()
    const { comment, donor_address, donation_address, donation_total, token, token_type } = donation

    let approved: _UnboxPromise<ReturnType<typeof walletAPI.approveERC20Token>> | undefined

    // approve splitter contract for spending erc20 token
    if (token_type === EthereumTokenType.erc20) {
        approved = await getProvider().approveERC20Token(
            donor_address,
            getNetworkSettings().splitterContractAddress,
            token?.address!,
            // add approve buffer
            new BigNumber(donation_total).plus(1e5),
        )
    }

    const funded = await getProvider().fund(
        donor_address,
        gitcoinDonationAddress,
        donation_address,
        donation_total,
        token?.address,
    )
    const record: GitcoinDonationRecord = {
        _data_source_: 'real',
        donor_address,
        donation_address,
        donation_total,
        network: networkType,
        token_type,
        erc20_token: token?.address,
        comment,
        ...approved,
        ...funded,
    }

    // TODO:
    // persistant record in DB
    {
    }

    PluginMessageCenter.emit('maskbook.gitcoin.update', undefined)
    return record
}
