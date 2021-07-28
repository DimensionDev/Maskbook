import { createGlobalState } from '@masknet/shared'
import { Messages, Services } from '../../API'
import type { DataProvider } from '@masknet/public-api'
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

export const [useAncientPostsCompatibilityMode] = createGlobalState(
    Services.Settings.getAncientPostsCompatibiltyMode,
    (x) => Messages.events.disableOpenNewTabInBackgroundSettings.on(x),
)

const API_HOST = 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com'
const SEND_CODE_URL = `${API_HOST}/api/v1/backup/send_code`
const VERIFY_CODE_URL = `${API_HOST}/api/v1/backup`
const DOWNLOAD_LINK_URL = `${API_HOST}/api/v1/backup/download`

interface SendCodeBody {
    account: string
    type: AccountValidationType
}

export const sendCode = ({ account, type }: SendCodeBody) => {
    return fetch(SEND_CODE_URL, {
        method: 'POST',
        body: JSON.stringify({
            account,
            account_type: type,
        }),
    }).then(async (res) => {
        // todo: align error handler
        if (!res.ok) {
            return Promise.reject(await res.json())
        }
        return await res.json()
    })
}

export interface VerifyCodeBody extends SendCodeBody {
    code: string
}

export const fetchDownloadLink = (body: VerifyCodeBody) => {
    return fetch(DOWNLOAD_LINK_URL, {
        method: 'POST',
        body: JSON.stringify({
            code: body.code,
            account_type: body.type,
            account: body.account,
        }),
    }).then<BackupFileInfo>(async (res) => {
        const json = await res.json()
        return {
            downloadURL: json.download_url,
            size: json.size,
            uploadedAt: json.uploaded_at,
            abstract: json.abstract,
        }
    })
}

export const verifyCode = ({ account, type, code }: VerifyCodeBody) => {
    return fetch(VERIFY_CODE_URL, {
        method: 'PUT',
        body: JSON.stringify({
            account,
            account_type: type,
            code,
        }),
    }).then((res) => res.json())
}
