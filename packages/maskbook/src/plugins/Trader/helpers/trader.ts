import BigNumber from 'bignumber.js'
import { BIPS_BASE } from '../constants'

export function toBips(bips: number) {
    return new BigNumber(bips).dividedBy(BIPS_BASE)
}
