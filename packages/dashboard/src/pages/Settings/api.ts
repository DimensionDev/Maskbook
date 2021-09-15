import { createGlobalState } from '@masknet/shared'
import { Messages, Services } from '../../API'
import type { DataProvider } from '@masknet/public-api'
import type { AccountType, BackupFileInfo, Scenario, Locale } from './type'
export const [useLanguage] = createGlobalState(Services.Settings.getLanguage, Messages.events.languageSettings.on)

export const [useTrendingDataSource] = createGlobalState<DataProvider>(
    Services.Settings.getTrendingDataSource,
    Messages.events.currentTrendingDataProviderSettings.on,
)

export const [useEthereumNetworkTradeProvider] = createGlobalState(
    Services.Settings.getEthereumNetworkTradeProvider,
    Messages.events.ethereumNetworkTradeProviderSettings.on,
)

export const [usePolygonNetworkTradeProvider] = createGlobalState(
    Services.Settings.getPolygonNetworkTradeProvider,
    Messages.events.polygonNetworkTradeProviderSettings.on,
)

export const [useBinanceNetworkTradeProvider] = createGlobalState(
    Services.Settings.getBinanceNetworkTradeProvider,
    Messages.events.binanceNetworkTradeProviderSettings.on,
)

export const [useArbitrumNetworkTradeProvider] = createGlobalState(
    Services.Settings.getArbitrumNetworkTradeProvider,
    Messages.events.arbitrumNetworkTradeProviderSettings.on,
)

export const [usexDaiNetworkTradeProvider] = createGlobalState(
    Services.Settings.getxDaiNetworkTradeProvider,
    Messages.events.xdaiNetworkTradeProviderSettings.on,
)

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
            return Promise.reject<T>({ status: res.status, ...result })
        }
        return Promise.resolve<T>(result)
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
            account,
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
            account,
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
            account,
        }),
    }).then<BackupFileInfo>(({ abstract, download_url, size, uploaded_at }) => {
        return {
            downloadURL: download_url,
            size: size,
            uploadedAt: uploaded_at,
            abstract: abstract,
        }
    })
}

export const verifyCode = ({ account, type, code }: VerifyCodeRequest) => {
    return fetchBackupInstance('v1/backup/validate_code', {
        method: 'POST',
        body: JSON.stringify({
            account,
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
