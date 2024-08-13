import urlcat from 'urlcat'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { LIDO_REQUEST_TIME_API, LIDO_STETH_APR_API } from './constants.js'

export class Lido {
    static async getStEthAPR() {
        const apr = await fetchJSON<{ data: { smaApr: string } }>(LIDO_STETH_APR_API, { mode: 'cors' })

        return apr.data.smaApr
    }

    static async getLidoWaitingTime(amount: string) {
        const result = await fetchJSON<{
            requestInfo: {
                finalizationAt: string
            }
        }>(urlcat(LIDO_REQUEST_TIME_API, { amount }), { mode: 'cors' })

        return result.requestInfo.finalizationAt
    }
}
