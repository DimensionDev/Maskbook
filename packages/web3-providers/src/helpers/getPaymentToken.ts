import {
    type ChainId,
    APE,
    BUSD,
    DAI,
    HUSD,
    RARI,
    // cspell:disable-next-line
    TATR,
    USDC,
    USDT,
    WBTC,
    WNATIVE,
    CHAIN_DESCRIPTORS,
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
    return [
        CHAIN_DESCRIPTORS.find((x) => x.chainId === (chainId as ChainId))?.nativeCurrency,
        ...tokens.map((x) => x[chainId]),
    ].find(
        (x) =>
            x?.name.toLowerCase() === token.name?.toLowerCase() ||
            x?.symbol.toLowerCase() === token.symbol?.toLowerCase() ||
            isSameAddress(x?.address, token.address),
    )
}
