import { OnlyRunInContext } from '@holoflows/kit'
import { CryptoKeyRecord, getMyPrivateKey, toStoreCryptoKey } from '../../key-management/keystore-db'
import { encodeText } from '../../utils/type-transform/String-ArrayBuffer'
import { getMyLocalKey } from '../../key-management/local-db'
import { sleep } from '../../utils/utils'
import { regularUsername } from '../../utils/type-transform/Username'
import { geti18nString } from '../../utils/i18n'

OnlyRunInContext('background', 'WelcomeService')
export async function backupMyKeyPair() {
    // Don't make the download pop so fast
    await sleep(1000)
    const key = await getMyPrivateKey()
    const localKey = await crypto.subtle.exportKey('jwk', (await getMyLocalKey()).key)
    if (!key) throw new TypeError(geti18nString('service_have_no_own_key_yet'))
    const keyRecord: CryptoKeyRecord = await toStoreCryptoKey(key)
    const string = JSON.stringify({ key: keyRecord, local: localKey })
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

export async function openWelcomePage(username: string) {
    if (!regularUsername(username)) throw new TypeError(geti18nString('service_username_invalid'))
    // TODO: move to .open options page api
    return browser.tabs.create({ url: browser.runtime.getURL('index.html#/welcome?username=' + username) })
}
