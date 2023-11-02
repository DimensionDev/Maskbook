import type { BackupAccountType } from '@masknet/shared-base'
import type { BackupFileInfo, Scenario, Locale } from './type.js'

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
