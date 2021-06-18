import { ERC20TokenDetailed, MatchAddress } from '@dimensiondev/web3-shared'
import LBP from '../apis/LBP/LBP.json'
import { useMemo } from 'react'
import { Flags } from '../../../utils/flags'

export function useLBP(token?: ERC20TokenDetailed) {
    return useMemo(() => {
        if (!token) return
        // read LBP from the whitelist
        const matchAddress = MatchAddress(token.address)
        const LBP_ = LBP.find((x) => matchAddress(x.token.address))
        return (
            LBP_ ??
            (Flags.LBP_whitelist_enabled
                ? undefined
                : {
                      name: `${token.name} LBP`,
                      duration: 3 /* months */ * 30 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */,
                      token,
                  })
        )
    }, [token?.address])
}
