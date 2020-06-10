import { BigNumber } from 'bignumber.js'
import { gitcoinAPI, walletAPI } from './api'
import {
    GitcoinDonationPayload,
    GitcoinDonationRecord,
    GitcoinDonationRecordInDatabase,
    EthereumTokenType,
} from './database/types'
import { getNetworkSettings } from './UI/Developer/SelectEthereumNetwork'
import { PluginMessageCenter } from '../PluginMessages'
import type { _UnboxPromise } from '@holoflows/kit/node_modules/async-call-rpc'
import { createTransaction, IDBPSafeTransaction } from '../../database/helpers/openDB'
import { createWalletDBAccess, WalletDB } from './database/Wallet.db'
import { omit } from 'lodash-es'

function getProvider() {
    return {
        ...gitcoinAPI,
        ...walletAPI,
    }
}

export async function donateGrant(donation: GitcoinDonationPayload) {
    const { networkType, gitcoinDonationAddress } = getNetworkSettings()
    const { donor_address, donation_address, donation_total, token, token_type } = donation

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

    // fund
    const funded = await getProvider().fund(
        donor_address,
        gitcoinDonationAddress,
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
        ...funded,
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
