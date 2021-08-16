import { createGlobalState } from '@masknet/shared'
import { Services, Messages } from '../../API'
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

const API_HOST = 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com'
const SEND_CODE_URL = `${API_HOST}/api/v1/backup/send_code`
const VERIFY_CODE_URL = `${API_HOST}/api/v1/backup/validate_code`
const DOWNLOAD_URL = `${API_HOST}/api/v1/backup/download`

interface SendCodeProps {
    account: string
    type: 'email' | 'phone'
}

export const sendCode = ({ account, type }: SendCodeProps) => {
    return fetch(SEND_CODE_URL, {
        method: 'POST',
        body: JSON.stringify({
            account,
            account_type: type,
        }),
    }).then((res) => res.json())
}

interface VerifyCodeProps extends SendCodeProps {
    code: string
}

export const verifyCode = ({ account, type, code }: VerifyCodeProps) => {
    return fetch(VERIFY_CODE_URL, {
        method: 'POST',
        body: JSON.stringify({
            account,
            account_type: type,
            code,
        }),
    }).then((res) => res.json())
}

export const download = ({ account, type, code }: VerifyCodeProps) => {
    return fetch(DOWNLOAD_URL, {
        method: 'POST',
        body: JSON.stringify({
            account,
            account_type: type,
            code,
        }),
    })
}
