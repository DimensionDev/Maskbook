import {
    APE,
    BUSD,
    type ChainId,
    createNativeToken,
    DAI,
    HUSD,
    RARI,
    TATR,
    USDC,
    USDT,
    WBTC,
    WNATIVE,
} from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isSameAddress } from '@masknet/web3-shared-base'

/* cspell:disable-next-line */
const tokens = [APE, USDC, USDT, DAI, HUSD, BUSD, WBTC, WNATIVE, TATR, RARI]

export function getPaymentToken(
    chainId: Web3Helper.ChainIdAll,
    token?: { name?: string; symbol?: string; address?: string },
) {
    if (!token) return
    return [createNativeToken(chainId as ChainId), ...tokens.map((x) => x[chainId])].find(
        (x) =>
            x.name.toLowerCase() === token.name?.toLowerCase() ||
            x.symbol.toLowerCase() === token.symbol?.toLowerCase() ||
            isSameAddress(x.address, token.address),
    )
}
