import { OnlyRunInContext } from '@holoflows/kit'
import { encodeText } from '../../utils/type-transform/String-ArrayBuffer'
import { sleep } from '../../utils/utils'
import { regularUsername } from '../../social-network-provider/facebook.com/parse-username'
import { geti18nString } from '../../utils/i18n'
import {
    getMyIdentitiesDB,
    PersonRecordPublicPrivate,
    getLocalKeysDB,
    PersonRecordPublic,
    queryPeopleDB,
    generateLocalKeyDB,
    generateMyIdentityDB,
    queryLocalKeyDB,
    queryMyIdentityAtDB,
} from '../../database/people'
import { BackupJSONFileLatest } from '../../utils/type-transform/BackupFile'
import { PersonIdentifier } from '../../database/type'
import { MessageCenter } from '../../utils/messages'

OnlyRunInContext('background', 'WelcomeService')
async function generateBackupJSON(whoAmI: PersonIdentifier, full = false): Promise<BackupJSONFileLatest> {
    const myIdentitiesInDB: BackupJSONFileLatest['whoami'] = []
    const peopleInDB: NonNullable<BackupJSONFileLatest['people']> = []

    const promises: Promise<void>[] = []
    //#region data.whoami
    const localKeys = await getLocalKeysDB()
    const myIdentity = await getMyIdentitiesDB()
    if (!whoAmI.isUnknown) {
        if ((await hasValidIdentity(whoAmI)) === false) {
            await createNewIdentity(whoAmI)
            return generateBackupJSON(whoAmI, full)
        }
    }
    async function addMyIdentitiesInDB(data: PersonRecordPublicPrivate) {
        myIdentitiesInDB.push({
            network: data.identifier.network,
            userId: data.identifier.userId,
            nickname: data.nickname,
            previousIdentifiers: data.previousIdentifiers,
            localKey: await exportKey(localKeys.get(data.identifier.network)![data.identifier.userId]!),
            publicKey: await exportKey(data.publicKey),
            privateKey: await exportKey(data.privateKey),
        })
    }
    for (const id of myIdentity) {
        promises.push(addMyIdentitiesInDB(id))
    }
    //#endregion

    //#region data.people
    async function addPeople(data: PersonRecordPublic) {
        peopleInDB.push({
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
            whoami: myIdentitiesInDB,
            people: peopleInDB,
        }
    else
        return {
            version: 1,
            whoami: myIdentitiesInDB,
        }
    function exportKey(k: CryptoKey) {
        return crypto.subtle.exportKey('jwk', k)
    }
}
async function hasValidIdentity(whoAmI: PersonIdentifier) {
    const local = await queryLocalKeyDB(whoAmI)
    const ecdh = await queryMyIdentityAtDB(whoAmI)
    if (!local || !ecdh || !ecdh.privateKey || !ecdh.publicKey) return false
    return true
}

async function createNewIdentity(whoAmI: PersonIdentifier) {
    await generateLocalKeyDB(whoAmI)
    await generateMyIdentityDB(whoAmI)
    // ? New user !
    MessageCenter.emit('generateKeyPair', undefined)
    console.log('New user! Generating key pairs')
}

export async function backupMyKeyPair(whoAmI: PersonIdentifier, download = true) {
    // Don't make the download pop so fast
    await sleep(1000)
    const obj = await generateBackupJSON(whoAmI)
    if (!download) return obj
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
        saveAs: true,
    })
    return obj
}

export async function openWelcomePage(id: PersonIdentifier, isMobile: boolean) {
    if (!regularUsername(id.userId)) throw new TypeError(geti18nString('service_username_invalid'))
    const url = browser.runtime.getURL('index.html#/welcome?identifier=' + id.toText())
    return browser.tabs.create({ url })
}
