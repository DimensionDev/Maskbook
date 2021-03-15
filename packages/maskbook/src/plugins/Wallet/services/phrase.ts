import { v4 as uuid } from 'uuid'
import { createTransaction } from '../../../database/helpers/openDB'
import { assert } from '../../../utils/utils'
import { ETHEREUM_PATH } from '../constants'
import type { PhraseRecord } from '../database/types'
import { createWalletDBAccess } from '../database/Wallet.db'
import { WalletMessages } from '../messages'
import { PhraseRecordIntoDB, PhraseRecordOutDB } from './helpers'
import * as wallet from './wallet'

export async function getPhrases() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Phrase')
    return t.objectStore('Phrase').getAll()
}

export async function getPhrase(query: string | ((record: PhraseRecord) => boolean)) {
    const records: PhraseRecord[] = []
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
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Phrase')
    const now = new Date()
    const record: PhraseRecord = {
        ...rec,
        id: uuid(),
        index: 0,
        createdAt: now,
        updatedAt: now,
    }
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
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Phrase')
    const record = await getPhrase(rec.id)
    assert(record)
    await t.objectStore('Phrase').put(
        PhraseRecordIntoDB({
            ...record,
            ...rec,
            updatedAt: new Date(),
        }),
    )
    WalletMessages.events.phrasesUpdated.sendToAll(undefined)
}

//#region derive a new wallet from phrase
const MAX_DERIVE_COUNT = 999

export async function deriveWalletFromPhrase(name: string, mnemonic: string[], passphrase: string, path = ETHEREUM_PATH, index = 0) {
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
        const derivedWallet = await wallet.recoverWallet(phrase.mnemonic, phrase.passphrase, path, i)
        const walletRecord = await wallet.getWallet(derivedWallet.address)
        // ensure the wallet never derived before
        if (walletRecord) continue
        // create wallet from mnemonic words
        await wallet.importNewWallet({
            name,
            mnemonic: phrase.mnemonic,
            passphrase: phrase.passphrase,
        })
        // update the address index of phrase
        await updatePhrase({
            id: phrase.id,
            index: i,
        })
    }
    throw new Error('Derive too many times.')
}
//#endregion
