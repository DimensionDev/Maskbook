import { fetchJSON } from '../helpers/fetchJSON.js'
import { LIDO_STETH_APR_API } from './constants.js'
import type { LidoBaseAPI } from '../entry-types.js'

export class LidoAPI implements LidoBaseAPI.Provider {
    async getStEthAPR() {
        const apr = await fetchJSON<number>(LIDO_STETH_APR_API, { mode: 'cors' })
        return apr.toString()
    }
}
