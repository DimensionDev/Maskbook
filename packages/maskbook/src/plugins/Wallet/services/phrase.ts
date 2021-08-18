import { v4 as uuid } from 'uuid'
import { createTransaction } from '../../../database/helpers/openDB'
import { assert } from '../../../utils/utils'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '../constants'
import type { PhraseRecord } from '../database/types'
import { createWalletDBAccess } from '../database/Wallet.db'
import { WalletMessages } from '../messages'
import { PhraseRecordIntoDB, PhraseRecordOutDB } from './helpers'
import * as wallet from './wallet'
import { getBalance } from '../../../extension/background-script/EthereumService'

export async function getPhrases() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Phrase')
    return t.objectStore('Phrase').getAll()
}

export async function getPhrase(query: string | ((record: PhraseRecord) => boolean)) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Phrase')
    if (typeof query === 'string') return t.objectStore('Phrase').get(query) ?? null
    for await (const each of t.objectStore('Phrase')) {
        const record = PhraseRecordOutDB(each.value)
        if (query(record)) return record
    }
    return null
}

export async function addPhrase(rec: Omit<PhraseRecord, 'id' | 'index' | 'createdAt' | 'updatedAt'>) {
    const old = await getPhrase((x) => x.mnemonic.join(' ') === rec.mnemonic.join(' '))
    if (old) throw new Error('Add exists phrase.')

    // create a new phrase
    const now = new Date()
    const record: PhraseRecord = {
        ...rec,
        id: uuid(),
        index: 0,
        createdAt: now,
        updatedAt: now,
    }
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Phrase')
    await t.objectStore('Phrase').add(record)
    WalletMessages.events.phrasesUpdated.sendToAll(undefined)
    return record
}

export async function removePhrase(id: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Phrase')
    await t.objectStore('Phrase').delete(id)
    WalletMessages.events.phrasesUpdated.sendToAll(undefined)
}

export async function updatePhrase(
    rec: Omit<PhraseRecord, 'path' | 'mnemonic' | 'passphrase' | 'createdAt' | 'updatedAt'>,
) {
    const record = await getPhrase(rec.id)
    assert(record)
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Phrase')
    await t.objectStore('Phrase').put(
        PhraseRecordIntoDB({
            ...record,
            ...rec,
            updatedAt: new Date(),
        }),
    )
    WalletMessages.events.phrasesUpdated.sendToAll(undefined)
}

//#region derive a new wallet from the given secret phrase
const MAX_DERIVE_COUNT = 999

export async function deriveWalletFromPhrase(
    name: string,
    mnemonic: string[],
    passphrase: string,
    path = HD_PATH_WITHOUT_INDEX_ETHEREUM,
) {
    // find or create phrase from given secret phrase
    let phrase = await getPhrase((record) => record.mnemonic.join(' ') === mnemonic.join(' '))
    if (!phrase) {
        phrase = await addPhrase({
            mnemonic,
            passphrase,
            path,
        })
    }

    for (let i = phrase.index; i < MAX_DERIVE_COUNT; i += 1) {
        const derivedWallet = await wallet.recoverWalletFromMnemonicWords(
            phrase.mnemonic,
            phrase.passphrase,
            `${path}/${i}`,
        )

        // ensure the wallet had never created or derived before
        const walletRecord = await wallet.getWallet(derivedWallet.address)
        if (walletRecord) continue

        // create a wallet from mnemonic words
        const address = await wallet.importNewWallet({
            name,
            path: `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${i}`,
            mnemonic: phrase.mnemonic,
            passphrase: phrase.passphrase,
        })

        // update the address index of phrase
        await updatePhrase({
            id: phrase.id,
            index: i + 1,
        })
        return address
    }
    throw new Error('Derive too many times.')
}
//#endregion

//#region Query derivable wallet addresses
export async function queryDerivableWalletFromPhrase(
    mnemonic: string[],
    passphrase: string,
    page: number,
    pageSize = 10,
    path = HD_PATH_WITHOUT_INDEX_ETHEREUM,
) {
    const result = []
    for (let i = pageSize * (page - 1); i < pageSize * page && i < MAX_DERIVE_COUNT; i += 1) {
        const derivedWallet = await wallet.recoverWalletFromMnemonicWords(mnemonic, passphrase, `${path}/${i}`)
        const balance = await getBalance(derivedWallet.address)
        result.push({
            ...derivedWallet,
            balance,
        })
    }

    return result
}
//#endregion

//#region derive a new wallet from specified index
export async function deriveWalletFromIndex(mnemonic: string[], passphrase: string, index: number) {
    // find or create phrase
    let phrase = await getPhrase((record) => record.mnemonic.join(' ') === mnemonic.join(' '))
    if (!phrase) {
        phrase = await addPhrase({
            mnemonic,
            passphrase,
            path: HD_PATH_WITHOUT_INDEX_ETHEREUM,
        })
    }

    // create a wallet from mnemonic
    await wallet.importNewWallet({
        name: `Account${index + 1}`,
        path: `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${index}`,
        mnemonic: phrase.mnemonic,
        passphrase: phrase.passphrase,
    })

    // update the largest index
    if (index + 1 > phrase.index && index + 1 < MAX_DERIVE_COUNT) {
        await updatePhrase({
            id: phrase.id,
            index: index + 1,
        })
    }
}
//#endregion
