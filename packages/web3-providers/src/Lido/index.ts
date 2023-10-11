import { fetchJSON } from '../helpers/fetchJSON.js'
import { LIDO_STETH_APR_API } from './constants.js'

export class Lido {
    static async getStEthAPR() {
        const apr = await fetchJSON<number>(LIDO_STETH_APR_API, { mode: 'cors' })
        return apr.toString()
    }
}
