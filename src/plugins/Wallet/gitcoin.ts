import { BigNumber } from 'bignumber.js'
import { gitcoinAPI, walletAPI, erc20API } from './api'
import {
    GitcoinDonationPayload,
    GitcoinDonationRecord,
    GitcoinDonationRecordInDatabase,
    EthereumTokenType,
} from './database/types'
import { PluginMessageCenter } from '../PluginMessages'
import type { _UnboxPromise } from '@holoflows/kit/node_modules/async-call-rpc'
import { createTransaction, IDBPSafeTransaction } from '../../database/helpers/openDB'
import { createWalletDBAccess, WalletDB } from './database/Wallet.db'
import { omit } from 'lodash-es'
import { getNetworkSettings } from './UI/Developer/EthereumNetworkSettings'

function getProvider() {
    return {
        ...gitcoinAPI,
        ...walletAPI,
        ...erc20API,
    }
}

export async function donateGrant(donation: GitcoinDonationPayload) {
    const { networkType, gitcoinMaintainerAddress } = getNetworkSettings()
    const { donor_address, donation_address, donation_total, token, token_type } = donation

    let approved: _UnboxPromise<ReturnType<typeof erc20API.approve>> | undefined

    // approve splitter contract for spending erc20 token
    if (token_type === EthereumTokenType.ERC20) {
        approved = await getProvider().approve(
            donor_address,
            getNetworkSettings().bulkCheckoutContractAddress,
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
        _data_source_: 'real',
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
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('GitcoinDonation')
        t.objectStore('GitcoinDonation').add(GitcoinDonationRecordIntoDB(record))
    }
    PluginMessageCenter.emit('maskbook.gitcoin.update', undefined)
    return record
}

export async function getDonationByID(
    t: undefined | IDBPSafeTransaction<WalletDB, ['GitcoinDonation'], 'readonly'>,
    id: string,
) {
    if (!t) t = createTransaction(await createWalletDBAccess(), 'readonly')('GitcoinDonation')
    const donations = await t.objectStore('GitcoinDonation').getAll()
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
