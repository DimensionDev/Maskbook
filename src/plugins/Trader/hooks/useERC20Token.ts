import { useAsync } from 'react-use'
import BigNumber from 'bignumber.js'
import type { ERC20TokenForUI } from '../types'

export function useERC20Token(address: string) {
    return useAsync(
        () =>
            Promise.resolve(
                address
                    ? ({
                          address,
                          name: 'TEST',
                          symbol: 'TT',
                          decimals: 18,
                          balance: new BigNumber(1.9834782489246211231323).multipliedBy(1e18).toFixed(),
                      } as ERC20TokenForUI)
                    : null,
            ),
        [address],
    )
}
