import { createGlobalState } from '@masknet/shared'
import { Services, Messages } from '../../API'

export const [useLanguage] = createGlobalState(Services.Settings.getLanguage, (x) =>
    Messages.events.languageSettings.on(x),
)

export const [useTrendingDataSource] = createGlobalState(Services.Settings.getTrendingDataSource, (x) =>
    Messages.events.currentTrendingDataProviderSettings.on(x),
)

export const [useAncientPostsCompatibilityMode] = createGlobalState(
    Services.Settings.getAncientPostsCompatibiltyMode,
    (x) => Messages.events.disableOpenNewTabInBackgroundSettings.on(x),
)

const API_HOST = 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com'
const SEND_CODE_URL = `${API_HOST}/api/v1/backup/send_code`
const VERIFY_CODE_URL = `${API_HOST}/api/v1/backup`

interface SendCodeProps {
    account: string
    type: 'email' | 'phone'
}

export const sendCode = ({ account, type }: SendCodeProps) => {
    return fetch(SEND_CODE_URL, {
        method: 'PUT',
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
        method: 'PUT',
        body: JSON.stringify({
            account,
            account_type: type,
            code,
        }),
    }).then((res) => res.json())
}
