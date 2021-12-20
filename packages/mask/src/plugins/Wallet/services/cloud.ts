import urlcat from 'urlcat'
import {
    __deprecated__getStorage,
    __deprecated__setStorage,
} from '../../../extension/background-script/HelperService/storage'

const HOST_MAP = {
    production: 'https://backup.mask.io/api',
    development: 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api',
    test: 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api',
}

const COULD_BASE_URL = HOST_MAP[process.env.NODE_ENV]
const RISK_WARNING_KEY = 'com.maskbook.agreement+riskWarning'

export const setRiskWarningConfirmed = (address: string, confirmed: boolean) =>
    __deprecated__setStorage<Record<string, boolean>>(
        RISK_WARNING_KEY,
        { [address]: confirmed },
        { howToUpdate: 'merge' },
    )

export const getRiskWarningConfirmed = async (address: string) => {
    const allStatus = await __deprecated__getStorage<Record<string, boolean>>(RISK_WARNING_KEY)
    return allStatus?.[address]
}

const sendRiskWarningConfirm = (address: string, pluginId?: string) =>
    fetch(urlcat(COULD_BASE_URL, '/v1/risk_warning/confirm'), {
        method: 'POST',
        body: JSON.stringify({
            address,
            plugin_id: pluginId ?? '',
        }),
    })

export const confirmRiskWarning = async (address: string, pluginId?: string) => {
    await setRiskWarningConfirmed(address, true)
    await sendRiskWarningConfirm(address, pluginId)
}
