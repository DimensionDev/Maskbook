import type { AccountType, BackupFileInfo, Scenario, Locale } from './type.js'

const BASE_RUL = 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api'

interface BackupBaseRequest {
    account: string
    type: AccountType
}

interface SendCodeRequest extends BackupBaseRequest {
    scenario: Scenario
    locale: Locale
}

export interface VerifyCodeRequest extends BackupBaseRequest {
    code: string
}

interface UploadLinkRequest extends BackupBaseRequest {
    code: string
    abstract: string
}

const withErrorMiddleware =
    <T>(handler: (res: Response) => Promise<T>) =>
    async (res: Response) => {
        const result = await handler(res)
        if (!res.ok) {
            // eslint-disable-next-line no-throw-literal
            throw { status: res.status, ...result }
        }
        return result
    }

const fetchBase = <T = any>(
    input: RequestInfo,
    init?: RequestInit,
    handler: (res: Response) => Promise<T> = (res) => res.json(),
) => fetch(input, init).then(withErrorMiddleware<T>(handler))

const fetchBaseInstance = (baseURL: string) => (input: RequestInfo, init?: RequestInit) =>
    fetchBase(`${baseURL}/${input}`, init)

const fetchBackupInstance = fetchBaseInstance(BASE_RUL)

export const sendCode = ({ account, type, scenario, locale }: SendCodeRequest) => {
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

export const fetchUploadLink = ({ code, account, abstract, type }: UploadLinkRequest) => {
    return fetchBackupInstance('v1/backup/upload', {
        method: 'POST',
        body: JSON.stringify({
            code,
            account_type: type,
            account: account.replace(' ', ''),
            abstract,
        }),
    }).then<string>((res) => res.upload_url)
}

export const fetchDownloadLink = ({ account, code, type }: VerifyCodeRequest) => {
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

export const verifyCode = ({ account, type, code }: VerifyCodeRequest) => {
    return fetchBackupInstance('v1/backup/validate_code', {
        method: 'POST',
        body: JSON.stringify({
            account: account.replace(' ', ''),
            account_type: type,
            code,
        }),
    })
}

export const fetchBackupValue = (downloadLink: string) => {
    return fetchBase<ArrayBuffer>(downloadLink, { method: 'GET' }, (res) => res.arrayBuffer())
}

export const uploadBackupValue = (uploadLink: string, content: ArrayBuffer) => {
    return fetch(uploadLink, {
        method: 'PUT',
        // mode: 'no-cors',
        headers: new Headers({ 'content-type': 'application/octet-stream' }),
        body: content,
    })
}
