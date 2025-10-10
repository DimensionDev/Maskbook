import { PersistentStorages } from '@masknet/shared-base'

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

    const res2 = await fetch('https://api.firefly.land/v3/auth/exchange/twitter', {
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
