import { OnlyRunInContext } from '@holoflows/kit'
import { encodeText } from '../../utils/type-transform/String-ArrayBuffer'
import { sleep } from '../../utils/utils'
import { regularUsername } from '../../utils/type-transform/Username'
import { geti18nString } from '../../utils/i18n'
import {
    getDefaultLocalKeyOrGenerateOneDB,
    getMyIdentitiesDB,
    PersonRecordPublicPrivate,
    getLocalKeysDB,
    PersonRecordPublic,
    queryPeopleDB,
    generateLocalKeyDB,
    generateMyIdentityDB,
} from '../../database/people'
import { BackupJSONFileLatest } from '../../utils/type-transform/BackupFile'
import { PersonIdentifier } from '../../database/type'

OnlyRunInContext('background', 'WelcomeService')
async function generateBackupJSON(identifier: PersonIdentifier, full = false): Promise<BackupJSONFileLatest> {
    const whoami: BackupJSONFileLatest['whoami'] = []
    const people: NonNullable<BackupJSONFileLatest['people']> = []

    const promises: Promise<void>[] = []
    //#region data.whoami
    const localKeys = await getLocalKeysDB()
    if (localKeys.size === 0) {
        // ? New user !
        console.log('New user! Generating key pairs')
        await generateLocalKeyDB(identifier)
        await generateMyIdentityDB(identifier)
        return generateBackupJSON(identifier, full)
    }
    async function addWhoAmI(data: PersonRecordPublicPrivate) {
        whoami.push({
            network: data.identifier.network,
            userId: data.identifier.userId,
            nickname: data.nickname,
            previousIdentifiers: data.previousIdentifiers,
            localKey: await exportKey(localKeys.get(data.identifier.network)![data.identifier.userId]!),
            publicKey: await exportKey(data.publicKey),
            privateKey: await exportKey(data.privateKey),
        })
    }
    for (const id of await getMyIdentitiesDB()) {
        promises.push(addWhoAmI(id))
    }
    //#endregion

    //#region data.people
    async function addPeople(data: PersonRecordPublic) {
        people.push({
            network: data.identifier.network,
            userId: data.identifier.userId,
            groups: data.groups.map(g => ({ network: g.network, groupId: g.groupId, type: g.type })),
            nickname: data.nickname,
            previousIdentifiers: (data.previousIdentifiers || []).map(p => ({ network: p.network, userId: p.userId })),
            publicKey: await exportKey(data.publicKey),
        })
    }
    if (full) {
        for (const p of await queryPeopleDB(() => true)) {
            if (p.publicKey) promises.push(addPeople(p as PersonRecordPublic))
        }
    }
    //#endregion

    await Promise.all(promises)
    if (full)
        return {
            version: 1,
            whoami,
            people,
        }
    else
        return {
            version: 1,
            whoami,
        }
    function exportKey(k: CryptoKey) {
        return crypto.subtle.exportKey('jwk', k)
    }
}
export async function backupMyKeyPair(identifier: PersonIdentifier) {
    // Don't make the download pop so fast
    await sleep(1000)
    const obj = await generateBackupJSON(identifier)
    const string = JSON.stringify(obj)
    const buffer = encodeText(string)
    const blob = new Blob([buffer], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const date = new Date()
    const today = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
        .getDate()
        .toString()
        .padStart(2, '0')}`
    browser.downloads.download({
        url,
        filename: `maskbook-keystore-backup-${today}.json`,
        conflictAction: 'prompt',
        saveAs: true,
    })
}

export async function openWelcomePage(id: PersonIdentifier) {
    if (!regularUsername(id.userId)) throw new TypeError(geti18nString('service_username_invalid'))
    return browser.tabs.create({ url: browser.runtime.getURL('index.html#/welcome?identifier=' + id.toText()) })
}
