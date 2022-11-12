import { Markets } from '../types.js'

export function setMarketLabel() {
    if (Markets.TotalRounds) return 'ok'

    return 'no'
}
