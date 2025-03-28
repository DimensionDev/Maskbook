import Services from '#services'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import { format as formatDateTime } from 'date-fns'

interface Options {
    code: string
    clientId: string
    redirectUri: string
}

interface TokenResponse {
    access_token: string
    error_description: string
}

export async function requestGoogleDriveAccessToken(options: Options) {
    return fetchJSON<TokenResponse>('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code: options.code,
            client_id: options.clientId,
            redirect_uri: options.redirectUri,
            grant_type: 'authorization_code',
        }),
    })
}

export function downloadBackup(url: string, name?: string) {
    const a = document.createElement('a')
    a.href = url
    if (name) a.download = name
    a.click()
}

export function getGoogleDriveAccessToken() {
    return Services.Backup.getAccessToken()
}

export function createBackupName() {
    return `mask-network-keystore-backup-${formatDateTime(new Date(), 'yyyy-MM-dd')}.bin`
}
