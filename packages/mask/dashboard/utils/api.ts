import { t } from '@lingui/core/macro'
import { format as formatDateTime } from 'date-fns'
import type { BackupAccountType } from '@masknet/shared-base'
import type { BackupFileInfo, Scenario, Locale } from './type.js'
import Services from '#services'

const BASE_RUL = 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api'

interface BackupBaseRequest {
    account: string
    type: BackupAccountType
}

interface SendCodeRequest extends BackupBaseRequest {
    scenario: Scenario
    locale: Locale
}

interface VerifyCodeRequest extends BackupBaseRequest {
    code: string
}

interface UploadLinkRequest extends BackupBaseRequest {
    code: string
    abstract: string
}

export interface RestoreQueryError {
    status: number
    message: string
}

function withErrorMiddleware<T>(handler: (res: Response) => Promise<T>) {
    return async (res: Response) => {
        const result = await handler(res)
        if (!res.ok) {
            throw { status: res.status, ...result }
        }
        return result
    }
}

function fetchBase<T = any>(
    input: RequestInfo,
    init?: RequestInit,
    handler: (res: Response) => Promise<T> = (res) => res.json(),
) {
    return fetch(input, init).then(withErrorMiddleware<T>(handler))
}

function fetchBackupInstance(input: RequestInfo, init?: RequestInit) {
    // TODO: handle the rest properties on input?
    return fetchBase(`${BASE_RUL}/${typeof input === 'string' ? input : input.url}`, init)
}

export function sendCode({ account, type, scenario, locale }: SendCodeRequest) {
    return fetchBackupInstance('v1/backup/send_code', {
        method: 'POST',
        body: JSON.stringify({
            account: account.replace(' ', ''),
            account_type: type,
            scenario,
            locale,
        }),
    })
}

export async function fetchUploadLink({ code, account, abstract, type }: UploadLinkRequest) {
    const res = await fetchBackupInstance('v1/backup/upload', {
        method: 'POST',
        body: JSON.stringify({
            code,
            account_type: type,
            account: account.replace(' ', ''),
            abstract,
        }),
    })
    const result: string = res.upload_url
    return result
}

export async function fetchDownloadLink({ account, code, type }: VerifyCodeRequest) {
    return fetchBackupInstance('v1/backup/download', {
        method: 'POST',
        body: JSON.stringify({
            code,
            account_type: type,
            account: account.replace(' ', ''),
        }),
    }).then<BackupFileInfo>(({ abstract, download_url, size, uploaded_at }) => {
        return {
            downloadURL: download_url,
            size,
            uploadedAt: uploaded_at,
            abstract,
        }
    })
}

export function fetchBackupValue(downloadLink: string) {
    return fetchBase<ArrayBuffer>(downloadLink, { method: 'GET' }, (res) => res.arrayBuffer())
}

export function uploadBackupValue(uploadLink: string, content: ArrayBuffer, signal: AbortSignal) {
    return fetch(uploadLink, {
        method: 'PUT',
        // mode: 'no-cors',
        headers: new Headers({ 'content-type': 'application/octet-stream' }),
        body: content,
    })
}

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
                method: 'GET',
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

export function getGoogleDriveAccessToken() {
    return Services.Backup.getAccessToken()
}
export function clearGoogleDriveAccessToken() {
    return Services.Backup.clearAccessToken()
}
