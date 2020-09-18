import { useAsync } from 'react-use'
import BigNumber from 'bignumber.js'
import type { Coin, ERC20TokenForUI } from '../types'

export function useERC20Token(token?: Coin | null) {
    return useAsync(
        () =>
            Promise.resolve(
                token?.eth_address
                    ? ({
                          address: token.eth_address,
                          name: 'TEST',
                          symbol: 'TT',
                          decimals: 18,
                          image_url: token.image_url,
                          balance: new BigNumber(1.9834782489246211231323).multipliedBy(1e18).toFixed(),
                      } as ERC20TokenForUI)
                    : null,
            ),
        [token?.eth_address],
    )
}
