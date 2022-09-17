import { EMPTY_LIST } from '@masknet/shared-base'
import { currySameAddress } from '@masknet/web3-shared-base'
import {
    ChainId,
    formatEthereumAddress,
    getTokenAssetBaseURLConstants,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import type { TokenIconAPI } from '../types/TokenIcon.js'
import SPECIAL_ICON_LIST from './TokenIconSpecialIconList.json'

export class CF_API implements TokenIconAPI.Provider<ChainId> {
    async getFungibleTokenIconURLs(chainId: ChainId, address: string): Promise<string[]> {
        const { NATIVE_TOKEN_ASSET_BASE_URI = EMPTY_LIST, ERC20_TOKEN_ASSET_BASE_URI = EMPTY_LIST } =
            getTokenAssetBaseURLConstants(chainId)
        const formattedAddress = formatEthereumAddress(address)

        if (isNativeTokenAddress(formattedAddress)) {
            return NATIVE_TOKEN_ASSET_BASE_URI?.map((x) => `${x}/info/logo.png/public`)
        }

        const specialIcon = SPECIAL_ICON_LIST.find(currySameAddress(address))
        if (specialIcon) return [specialIcon.logo_url]

        // load from remote
        return ERC20_TOKEN_ASSET_BASE_URI.map((x) => `${x}/${formattedAddress}/logo.png/quality=85`)
    }
}
