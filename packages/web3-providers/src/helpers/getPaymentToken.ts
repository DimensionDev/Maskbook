/// <reference types="@masknet/global-types/firefox" />
/// <reference types="@masknet/global-types/flag" />

import {
    APE,
    BUSD,
    ChainId,
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
import { isSameAddress } from '@masknet/web3-shared-base'

export function getPaymentToken(chainId: ChainId, token?: { name?: string; symbol?: string; address?: string }) {
    if (!token) return

    return [
        createNativeToken(chainId),
        /* cspell:disable-next-line */
        ...[APE, USDC, USDT, DAI, HUSD, BUSD, WBTC, WNATIVE, TATR, RARI].map((x) => x[chainId]),
    ].find(
        (x) =>
            x.name.toLowerCase() === token.name?.toLowerCase() ||
            x.symbol.toLowerCase() === token.symbol?.toLowerCase() ||
            isSameAddress(x.address, token.address),
    )
}
