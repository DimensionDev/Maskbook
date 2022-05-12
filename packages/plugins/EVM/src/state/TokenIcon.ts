import type { Plugin } from '@masknet/plugin-infra'
import SPECIAL_ICON_LIST from './TokenIcon/TokenIconSpecialIconList.json'
import { currySameAddress, isSameAddress, TokenIconState } from '@masknet/web3-shared-base'
import { ChainId, formatEthereumAddress, getTokenAssetBaseURLConstants, getTokenConstants } from '@masknet/web3-shared-evm'

export class TokenIcon implements TokenIconState<ChainId> {
    constructor(
        context: Plugin.Shared.SharedContext,
    ) {
    }
    async getFungibleTokenIconURLs(chainId: ChainId, address: string) {
        const {TOKEN_ASSET_BASE_URI = []} = getTokenAssetBaseURLConstants(chainId)
        const checkSummedAddress = formatEthereumAddress(address)

        if (isSameAddress(getTokenConstants().NATIVE_TOKEN_ADDRESS, checkSummedAddress)) {
            return TOKEN_ASSET_BASE_URI.map((x) => `${x}/info/logo.png`)
        }

        const specialIcon = SPECIAL_ICON_LIST.find(currySameAddress(address))
        if (specialIcon) return [specialIcon.logo_url]

        // load from remote
        return TOKEN_ASSET_BASE_URI.map((x) => `${x}/assets/${checkSummedAddress}/logo.png`)
    }
}
