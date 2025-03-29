import Services from '#services'
import { t } from '@lingui/core/macro'
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

/**
 * Download general backup file (no need to authenticate)
 */
export async function* progressDownload(url: string | null) {
    if (!url) return
    const response = await fetch(url, { method: 'GET', cache: 'no-store' })

    if (!response.ok || response.status !== 200) {
        throw new Error(t`The download link is expired`)
    }
    if (!response.body) return
    const reader = response.body.getReader()
    const contentLength = response.headers.get('Content-Length')

    if (!contentLength || !reader) return

    let received = 0
    const chunks: number[] = []
    while (true) {
        const { done, value } = await reader.read()

        if (done || !value) {
            yield 100
            break
        }
        chunks.push(...value)
        received += value.length

        yield (received / Number(contentLength)) * 100
    }
    return Uint8Array.from(chunks).buffer
}

export function getFileName(url: string) {
    try {
        const urlObj = new URL(url)
        return urlObj.pathname.split('/').pop()
    } catch {
        return ''
    }
}
