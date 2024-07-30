import urlcat from 'urlcat'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { LIDO_REQUEST_TIME_API, LIDO_STETH_APR_API } from './constants.js'

export class Lido {
    static async getStEthAPR() {
        const apr = await fetchJSON<number>(LIDO_STETH_APR_API, { mode: 'cors' })
        return apr.toString()
    }

    static async getLidoWatingTime(amount: string) {
        const result = await fetchJSON<{
            requestInfo: {
                finalizationAt: string
            }
        }>(urlcat(LIDO_REQUEST_TIME_API, { amount }), { mode: 'cors' })

        return result.requestInfo.finalizationAt
    }
}
