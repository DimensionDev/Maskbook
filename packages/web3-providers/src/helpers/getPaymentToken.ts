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
import type { Web3Helper } from '@masknet/web3-helpers'
import { isSameAddress } from '@masknet/web3-shared-base'

export function getPaymentToken(
    chainId: Web3Helper.ChainIdAll,
    token?: { name?: string; symbol?: string; address?: string },
) {
    if (!token) return

    return [
        createNativeToken(chainId as ChainId),
        /* cspell:disable-next-line */
        ...[APE, USDC, USDT, DAI, HUSD, BUSD, WBTC, WNATIVE, TATR, RARI].map((x) => x[chainId]),
    ].find(
        (x) =>
            x.name.toLowerCase() === token.name?.toLowerCase() ||
            x.symbol.toLowerCase() === token.symbol?.toLowerCase() ||
            isSameAddress(x.address, token.address),
    )
}
