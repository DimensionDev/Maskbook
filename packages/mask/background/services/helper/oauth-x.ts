import { timeout } from '@masknet/kit'
import { requestExtensionPermissionFromContentScript } from './request-permission.js'
import { XOAuthRequestOrigins } from '../../../shared/definitions/extension.js'

/** Modified from https://github.com/ddo/oauth-1.0a/blob/master/oauth-1.0a.js */
class OAuth {
    constructor(
        public consumer_key: string,
        public consumer_secret: string,
    ) {}
    async authorize(baseURL: string, paramData: object) {
        const oauth_data = {
            oauth_consumer_key: this.consumer_key,
            oauth_nonce: this.getNonce(),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: Math.floor(Date.now() / 1000),
            oauth_version: '1.0',
            ...paramData,
        }
        return {
            ...oauth_data,
            oauth_signature: await this.getSignature(oauth_data, baseURL, paramData),
        }
    }
    getSignature(oauth_data: object, baseURL: string, paramData: object) {
        return hash(this.getBaseString(oauth_data, baseURL, paramData), this.getSigningKey())
    }
    getBaseString(oauth_data: object, baseURL: string, paramData: object) {
        return (
            'POST&' +
            this.percentEncode(baseURL) +
            '&' +
            this.percentEncode(this.getParameterString(oauth_data, paramData))
        )
    }
    getParameterString(oauth_data: object, paramData: object) {
        const base_string_data = this.sortObject(this.percentEncodeData({ ...oauth_data, ...paramData }))

        let data_str = ''

        // base_string_data to string
        for (const [key, value] of base_string_data) {
            // check if the value is an array
            // this means that this key has multiple values
            if (value && Array.isArray(value)) {
                // sort the array first
                value.toSorted((a, b) => (String(a) > String(b) ? 1 : -1))

                let valString = ''
                value.forEach(function (item, i) {
                    valString += key + '=' + String(item)
                    if (i < value.length) {
                        valString += '&'
                    }
                })
                data_str += valString
            } else {
                data_str += key + '=' + String(value) + '&'
            }
        }

        // remove the last character
        data_str = data_str.slice(0, Math.max(0, data_str.length - 1))
        return data_str
    }
    getSigningKey() {
        return this.percentEncode(this.consumer_secret) + '&' + this.percentEncode('')
    }
    percentEncode(str: string) {
        return encodeURIComponent(str)
            .replaceAll('!', '%21')
            .replaceAll('*', '%2A')
            .replaceAll("'", '%27')
            .replaceAll('(', '%28')
            .replaceAll(')', '%29')
    }
    percentEncodeData(data: { [property: string]: any }) {
        const result: { [property: string]: any } = {}

        for (const key in data) {
            let value = data[key]
            // check if the value is an array
            if (value && Array.isArray(value)) {
                const newValue: string[] = []
                // percentEncode every value
                value.forEach((val) => {
                    newValue.push(this.percentEncode(val))
                })
                value = newValue
            } else {
                value = this.percentEncode(value)
            }
            result[this.percentEncode(key)] = value
        }

        return result
    }
    toHeader(oauth_data: object) {
        const sorted = this.sortObject(oauth_data)

        let header_value = 'OAuth '

        for (const [key, value] of sorted) {
            if (!key.startsWith('oauth_')) continue
            header_value += this.percentEncode(key) + '="' + this.percentEncode(value) + '", '
        }

        return {
            Authorization: header_value.slice(0, Math.max(0, header_value.length - 2)), // cut the last chars
        }
    }
    getNonce() {
        const word_characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''

        for (let i = 0; i < 32; i += 1) {
            result += word_characters[Math.floor(Math.random() * word_characters.length)]
        }

        return result
    }
    sortObject(data: object) {
        return Object.entries(data).toSorted(([keyA], [keyB]) => (keyA > keyB ? 1 : -1))
    }
}

async function hash(baseString: string, key: string) {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(key)
    const baseStringData = encoder.encode(baseString)
    const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: { name: 'SHA-1' } }, false, [
        'sign',
    ])
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, baseStringData)
    const bytes = new Uint8Array(signature)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i += 1) {
        binary += String.fromCodePoint(bytes[i])
    }
    return btoa(binary)
}

async function getRequestToken(client: OAuth) {
    const baseURL = 'https://api.twitter.com/oauth/request_token'
    const headers = client.toHeader(await client.authorize(baseURL, {}))
    const response = await fetch(baseURL, {
        method: 'POST',
        headers,
    })
    const body = await response.text()
    if (response.ok) {
        return new URLSearchParams(body)
    } else {
        throw new Error('Request failed: ' + body)
    }
}
function toBody(rec: { [property: string]: any }) {
    const x = new URLSearchParams()
    for (const key in rec) {
        const value = rec[key]
        x.set(key, value)
    }
    return x.toString()
}
async function getAccessToken(client: OAuth, options: { oauth_verifier: string; oauth_token: string }) {
    const url = 'https://api.twitter.com/oauth/access_token'

    const data = await client.authorize(url, options)
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: toBody(data),
    })
    const body = await response.text()
    if (response.ok) {
        return new URLSearchParams(body)
    } else {
        throw new Error('Request failed: ' + body)
    }
}

const client = new OAuth(process.env.FIREFLY_X_CLIENT_ID, process.env.FIREFLY_X_CLIENT_SECRET)
let pendingOAuth: PromiseWithResolvers<{ oauth_verifier: string; oauth_token: string }> | undefined
export async function requestXOAuthToken(): Promise<{ user_id: string | null; screen_name: string | null } | null> {
    await requestExtensionPermissionFromContentScript({
        origins: XOAuthRequestOrigins,
    })
    await Promise.all([
        fetch('https://firefly.social/api/mask/delegate-x-token'),
        fetch('https://canary.firefly.social/api/mask/delegate-x-token'),
    ])
    const step1 = await getRequestToken(client)
    const step1_oauth_token = step1.get('oauth_token')
    if (!step1_oauth_token) return null
    pendingOAuth = Promise.withResolvers()
    await browser.tabs.create({
        url: 'https://api.twitter.com/oauth/authenticate?oauth_token=' + step1_oauth_token,
    })
    const step2 = await getAccessToken(client, await timeout(pendingOAuth.promise, 1000 * 60))
    {
        const oauth_token = step2.get('oauth_token')
        const oauth_token_secret = step2.get('oauth_token_secret')
        const user_id = step2.get('user_id')
        const screen_name = step2.get('screen_name')

        await browser.storage.local.set({
            firefly_x_oauth: {
                oauth_token,
                oauth_token_secret,
                user_id,
                screen_name,
            },
        })
        return { user_id, screen_name }
    }
}

export async function resolveXOAuth(oauth_verifier: string | null, oauth_token: string | null) {
    if (!oauth_verifier || !oauth_token) {
        pendingOAuth?.reject(new Error('Invalid OAuth parameters'))
        return
    }
    pendingOAuth?.resolve({ oauth_verifier, oauth_token })
}

export function resetXOAuth() {
    browser.storage.local.remove('firefly_x_oauth')
}

export async function getXOAuthToken(): Promise<
    () => {
        oauth_token: string
        oauth_token_secret: string
        user_id: string
        screen_name: string
    } | null
> {
    const data = await browser.storage.local.get('firefly_x_oauth')
    // Note: return a function to avoid the token transmit to content script
    return () => data.firefly_x_oauth || null
}
