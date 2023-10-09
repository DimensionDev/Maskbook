import { fetchJSON } from '../helpers/fetchJSON.js'
import { LIDO_STETH_APR_API } from './constants.js'

class LidoAPI {
    async getStEthAPR() {
        const apr = await fetchJSON<number>(LIDO_STETH_APR_API, { mode: 'cors' })
        return apr.toString()
    }
}
export const Lido = new LidoAPI()
