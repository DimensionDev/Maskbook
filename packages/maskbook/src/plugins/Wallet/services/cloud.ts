import { getStorage, setStorage } from '../../../extension/background-script/StorageService'

const HOST_MAP = {
    production: 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api',
    development: 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api',
    test: 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api',
}

const COULD_BASE_URL = HOST_MAP[process.env.NODE_ENV]
const RISK_WARNING_KEY = 'com.maskbook.agreement+riskWarning'

export enum RiskWaringStatus {
    Confirmed = 'Confirmed',
    Canceled = 'Canceled',
    Unset = 'Unset',
}

export const setRiskWarningStatus = (address: string, status: RiskWaringStatus) =>
    setStorage<Record<string, RiskWaringStatus>>(RISK_WARNING_KEY, { [address]: status }, { howToUpdate: 'merge' })

export const getRiskWarningStatus = async (address: string) => {
    const allStatus = await getStorage<Record<string, RiskWaringStatus>>(RISK_WARNING_KEY)
    return allStatus?.[address]
}

const sendRiskWarningConfirm = (address: string, pluginId?: string) =>
    fetch(`${COULD_BASE_URL}/v1/risk_warning/confirm`, {
        method: 'POST',
        body: JSON.stringify({
            address,
            plugin_id: pluginId ?? '',
        }),
    })

export const confirmRiskWarning = async (address: string, pluginId?: string) => {
    const result = await sendRiskWarningConfirm(address, pluginId)
    if (result.ok) {
        await setRiskWarningStatus(address, RiskWaringStatus.Confirmed)
    }
}
