import type { RiskWarningBaseAPI } from '../types'

const BASE_URL_MAP: Record<typeof process.env.NODE_ENV, string> = {
    production: 'https://backup.mask.io/api',
    development: 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api',
    // @ts-ignore
    test: 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api',
}

const BASE_URL = BASE_URL_MAP[process.env.NODE_ENV]

export class RiskWarningAPI implements RiskWarningBaseAPI.Provider {
    async approve(address: string, pluginID = '') {
        await globalThis.r2d2Fetch(`${BASE_URL}/v1/risk_warning/confirm`, {
            method: 'POST',
            body: JSON.stringify({
                address,
                plugin_id: pluginID,
            }),
        })
    }
}
