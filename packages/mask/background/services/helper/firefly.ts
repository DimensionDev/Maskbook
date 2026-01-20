import { fromHex, toHex, PersistentStorages } from '@masknet/shared-base'

const FIREFLY_ROOT_URL = 'https://firefly.social'
const FIREFLY_API_URL = 'https://api.firefly.land'
const APP_LOGIN_ENCRYPT_IV = '0x4f05c37c16c801c2516b0338a8fd0cf9'

export async function loginFireflyViaTwitter() {
    const data = await browser.storage.local.get('firefly_x_oauth')
    if (!data?.firefly_x_oauth) throw new Error('X OAuth token not found')
    const oauth: Record<string, string> = data.firefly_x_oauth

    const res = await fetch('https://firefly.social/api/twitter/auth', {
        method: 'POST',
        headers: {
            'X-Access-Token': oauth.oauth_token,
            'X-Access-Token-Secret': oauth.oauth_token_secret,
            'X-Client-Id': oauth.oauth_token.split('-')[0],
            'X-Consumer-Key': process.env.FIREFLY_X_CLIENT_ID,
            'X-Consumer-Secret': '[HIDE_FROM_CLIENT]',
        },
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.message)

    const res2 = await fetch(`${FIREFLY_API_URL}/v3/auth/exchange/twitter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: json.data,
        }),
    })
    const json2 = await res2.json()
    await browser.storage.local.set({ firefly_account: json2.data })
    await PersistentStorages.Settings.storage.firefly_account.setValue(json2.data)
    return json2.data
}

// Desktop sync functions
export async function encrypt(plainText: string, cryptoKey: string): Promise<string> {
    const iv = fromHex(APP_LOGIN_ENCRYPT_IV)
    const cryptoBytes = new TextEncoder().encode(cryptoKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', cryptoBytes)
    const aesKey = await crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-CBC' }, false, ['encrypt'])

    const plainBytes = new TextEncoder().encode(plainText)
    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-CBC',
            iv,
        },
        aesKey,
        plainBytes,
    )

    const hex = toHex(new Uint8Array(encryptedBuffer))
    return hex.startsWith('0x') ? hex.slice(2) : hex
}

export interface DesktopLinkInfoResponse {
    link: string
    session: string
    expiresAt: string
}

export async function getDesktopSyncLinkInfo(accessToken: string): Promise<DesktopLinkInfoResponse> {
    const url = `${FIREFLY_API_URL}/desktop/sync/linkInfo`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
    if (!response.ok) throw new Error(`Failed to get desktop sync link info: ${response.statusText}`)
    const json = await response.json()
    if (json.code) throw new Error('Failed to get desktop sync link info, code: ' + json.code)
    return json.data
}

export enum DesktopSyncChannelStatus {
    Pending = 'pending',
    Scanned = 'scanned',
    Confirmed = 'confirmed',
    DataReady = 'dataReady',
    Cancel = 'cancel',
    Expired = 'expired',
}

export interface SyncChannelStatusResponse {
    status: DesktopSyncChannelStatus
}

export async function getSyncChannelStatus(session: string, accessToken: string): Promise<SyncChannelStatusResponse> {
    const url = `${FIREFLY_API_URL}/desktop/sync/channelStatus`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ session }),
    })
    if (!response.ok) throw new Error(`Failed to get sync channel status: ${response.statusText}`)
    const json = await response.json()
    return json.data
}

export type ConfirmSyncChannelOperation = 'confirm' | 'cancel'

export async function confirmSyncChannel(
    session: string,
    operation: ConfirmSyncChannelOperation,
    accessToken: string,
): Promise<{ status: string }> {
    const url = `${FIREFLY_API_URL}/desktop/sync/confirm`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ session, op: operation }),
    })
    if (!response.ok) throw new Error(`Failed to confirm sync channel: ${response.statusText}`)
    const json = await response.json()
    return json.data
}

export interface TwitterCookiesPayload {
    cookies: string
    fireflyAccountData: {
        accessToken: string
        accountId: string
        uid: string
        displayName: string
        avatar: string
    }
}

export async function syncTwitterCookies(
    session: string,
    cryptoKey: string,
    encryptedPayload: string,
    accessToken: string,
): Promise<void> {
    const url = `${FIREFLY_ROOT_URL}/api/firefly/desktop-sync/upload`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            session,
            cryptoKey,
            encryptedPayload,
        }),
    })
    if (!response.ok) throw new Error(`Failed to sync twitter cookies: ${response.statusText}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.message)
}
