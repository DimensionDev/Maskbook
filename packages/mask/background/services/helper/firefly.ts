import { fromHex, toHex, PersistentStorages } from '@masknet/shared-base'

const FIREFLY_ROOT_URL = 'https://firefly.social'
const FIREFLY_API_URL = 'https://api.firefly.land'
const APP_LOGIN_ENCRYPT_IV = '0x4f05c37c16c801c2516b0338a8fd0cf9'

// Types for desktop sync
export interface SocialAccountTwitter {
    type: 'x' // SourceInURL.X
    user_id: string
    handle: string
    consumerKey: string
    consumerKeySecret: string
    accessToken: string
    accessTokenSecret: string
    cookie?: string
}

export interface TwitterOAuthData {
    oauth_token: string
    oauth_token_secret: string
    user_id: string
    screen_name: string
}

export async function loginFireflyViaTwitter() {
    const data = await browser.storage.local.get('firefly_x_oauth')
    if (!data?.firefly_x_oauth) throw new Error('X OAuth token not found')
    const oauth: Record<string, string> = data.firefly_x_oauth

    const res = await fetch('https://firefly.social/api/twitter/auth', {
        method: 'POST',
        headers: {
            'X-Access-Token': oauth.oauth_token,
            'X-Access-Token-Secret': oauth.oauth_token_secret,
            'X-Client-Id': oauth.oauth_token.split('-', 1)[0],
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
    return hex.slice(2)
}

export interface DesktopLinkInfoResponse {
    link: string
    session: string
    expiresAt: string
}

export async function getDesktopSyncLinkInfo(accessToken: string): Promise<DesktopLinkInfoResponse> {
    const url = `${FIREFLY_API_URL}/desktop/sync/linkInfo`
    const response = await fetch(url, {
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
    twitterAccounts: SocialAccountTwitter[]
    fireflyAccountData: {
        firefly_account_token: string
        account_id: string
        account_uid: string
        display_name: string
        avatar: string
    }
}

// Helper function to get Twitter OAuth data from storage
export async function getTwitterOAuthData(): Promise<TwitterOAuthData | null> {
    const data = await browser.storage.local.get('firefly_x_oauth')
    if (!data?.firefly_x_oauth) return null
    return data.firefly_x_oauth as TwitterOAuthData
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
