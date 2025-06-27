const BASE_URL_MAP: Record<typeof process.env.NODE_ENV, string> = {
    production: 'https://backup.mask.io/api',
    development: 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api',
    test: 'https://vaalh28dbi.execute-api.ap-east-1.amazonaws.com/api',
}

const BASE_URL = BASE_URL_MAP[process.env.NODE_ENV]

export class RiskWarning {
    static async approve(address: string, pluginID = '') {
        await fetch(`${BASE_URL}/v1/risk_warning/confirm`, {
            method: 'POST',
            body: JSON.stringify({
                address,
                plugin_id: pluginID,
            }),
        })
    }
}
