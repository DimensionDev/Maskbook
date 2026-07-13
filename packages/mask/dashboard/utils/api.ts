import Services from '#services'
import { t } from '@lingui/core/macro'
import { format as formatDateTime } from 'date-fns'
export function downloadBackup(url: string, name?: string) {
    const a = document.createElement('a')
    a.href = url
    if (name) a.download = name
    a.click()
}

export function createBackupName() {
    return `mask-network-keystore-backup-${formatDateTime(new Date(), 'yyyy-MM-dd')}.bin`
}

export function getFileName(url: string) {
    try {
        const urlObj = new URL(url)
        return urlObj.pathname.split('/').pop()
    } catch {
        return ''
    }
}

/**
 * Download general backup file (no need to authenticate)
 */
export async function* progressDownload(request: string | null | (() => Promise<Response>), size?: number) {
    if (!request) return
    const response =
        typeof request === 'function' ?
            await request()
        :   await fetch(request, {
                cache: 'no-store',
            })

    if (!response.ok || response.status !== 200) {
        throw new Error(t`The download link is expired`)
    }
    if (!response.body) return
    const reader = response.body.getReader()
    const contentLength = response.headers.get('Content-Length') || size

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

export function getGoogleDriveAccessToken(interactive?: boolean) {
    return Services.Backup.getAccessToken(interactive)
}
export function clearGoogleDriveAccessToken() {
    return Services.Backup.clearAccessToken()
}
