import LBP from '../apis/LBP/LBP.json'
import type { ERC20TokenDetailed } from '../../../web3/types'
import { useMemo } from 'react'
import { isSameAddress } from '../../../web3/helpers'

export function useLBP(token?: ERC20TokenDetailed) {
    return useMemo(() => {
        if (!token?.address) return
        return LBP.find((x) => isSameAddress(x.token.address, token.address))
    }, [token?.address])
}
