import { fetchText } from '../entry-helpers.js'
import type { LidoBaseAPI } from '../entry-types.js'
import { LIDO_STETH_APR_API } from './constants.js'

export class LidoAPI implements LidoBaseAPI.Provider {
    async getStEthAPR() {
        const apr = await fetchText(LIDO_STETH_APR_API, { mode: 'cors' })
        return apr.replace(/"/g, '')
    }
}
