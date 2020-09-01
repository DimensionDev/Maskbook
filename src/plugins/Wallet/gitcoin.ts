import { BigNumber } from 'bignumber.js'
import { gitcoinAPI, walletAPI, erc20API } from './api'
import {
    GitcoinDonationPayload,
    GitcoinDonationRecord,
    GitcoinDonationRecordInDatabase,
    EthereumTokenType,
} from './database/types'
import { PluginMessageCenter } from '../PluginMessages'
import type { _UnboxPromise } from 'async-call-rpc/full'
import { omit } from 'lodash-es'
import { getNetworkSettings } from './UI/Developer/EthereumNetworkSettings'
import { createPluginWalletAccess } from '../../database/Plugin/wrap-wallet-for-plugin'
import { getCurrentEthChain } from '../../extension/background-script/PluginService'

const createTransaction = createPluginWalletAccess<GitcoinDonationRecordInDatabase, []>(
    'com.maskbook.provide.co.gitcoin',
)({}, 'donation_transaction_hash')
const ro = () => createTransaction('readonly')
const rw = () => createTransaction('readwrite')
type GitcoinPluginReificatedWalletDBReadOnly = _UnboxPromise<ReturnType<typeof ro>>
type GitcoinPluginReificatedWalletDBReadWrite = _UnboxPromise<ReturnType<typeof rw>>
function getProvider() {
    return {
        ...gitcoinAPI,
        ...walletAPI,
        ...erc20API,
    }
}

export async function donateGrant(donation: GitcoinDonationPayload) {
    const { networkType, gitcoinMaintainerAddress, bulkCheckoutContractAddress } = getNetworkSettings(
        await getCurrentEthChain(),
    )
    const { donor_address, donation_address, donation_total, token, token_type } = donation

    let approved: _UnboxPromise<ReturnType<typeof erc20API.approve>> | undefined

    // approve splitter contract for spending erc20 token
    if (token_type === EthereumTokenType.ERC20) {
        approved = await getProvider().approve(
            donor_address,
            bulkCheckoutContractAddress,
            token?.address!,
            new BigNumber(donation_total),
        )
    }

    // donate
    const donated = await getProvider().donate(
        donor_address,
        gitcoinMaintainerAddress,
        donation_address,
        donation_total,
        token?.address,
    )

    // persistant record in DB
    const record: GitcoinDonationRecord = {
        donor_address,
        donation_address,
        donation_total,
        network: networkType,
        token_type,
        erc20_token: token?.address,
        ...approved,
        ...donated,
    }
    {
        const t = await createTransaction('readwrite')
        t.add(GitcoinDonationRecordIntoDB(record))
    }
    PluginMessageCenter.emit('maskbook.gitcoin.update', undefined)
    return record
}

export async function getDonationByID(t: undefined | GitcoinPluginReificatedWalletDBReadOnly, id: string) {
    if (!t) t = await createTransaction('readonly')
    const donations = await t.getAll()
    const donation = donations.find((donation) => donation.donation_transaction_hash === id)
    if (donation) return GitcoinDonationRecordOutDB(donation)
    return
}

function GitcoinDonationRecordOutDB(x: GitcoinDonationRecordInDatabase): GitcoinDonationRecord {
    const names = ['donation_total', 'donation_value', 'tip_value', 'erc20_approve_value'] as const
    const record = omit(x, names) as GitcoinDonationRecord
    for (const name of names) {
        const original = x[name]
        if (typeof original !== 'undefined') {
            record[name] = new BigNumber(String(original))
        }
    }
    return record
}

function GitcoinDonationRecordIntoDB(x: GitcoinDonationRecord): GitcoinDonationRecordInDatabase {
    const names = ['donation_total', 'donation_value', 'tip_value', 'erc20_approve_value'] as const
    const record = omit(x, names) as GitcoinDonationRecordInDatabase
    for (const name of names) {
        const original = x[name]
        if (typeof original !== 'undefined') {
            record[name] = original.toString()
        }
    }
    return record
}
