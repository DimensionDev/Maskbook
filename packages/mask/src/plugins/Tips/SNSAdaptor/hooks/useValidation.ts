import { useContext, useMemo } from 'react'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useFungibleTokenBalance,
} from '@masknet/plugin-infra/web3'
import { isGreaterThan, isLessThanOrEqualTo, NetworkPluginID, rightShift } from '@masknet/web3-shared-base'
import { useI18N } from '../../locales/index.js'
import { AssetType } from '../../types/index.js'
import { TipsContext } from '../Context/index.js'

type Validation = [isValid: boolean, message?: string]

export function useValidation(): Validation {
    const t = useI18N()
    const { assetType, amount, fungibleToken, nonFungibleTokenId, nonFungibleTokenAddress } = useContext(TipsContext)
    const pluginID = useCurrentWeb3NetworkPluginID()
    const account = useAccount()
    const chainId = useChainId()
    const { value: balance = '0' } = useFungibleTokenBalance(pluginID, fungibleToken?.address, { chainId, account })

    const result = useMemo<Validation>(() => {
        if (assetType === AssetType.FungibleToken) {
            if (!amount || isLessThanOrEqualTo(amount, 0)) return [false]
            if (isGreaterThan(rightShift(amount, fungibleToken?.decimals), balance))
                return [false, t.token_insufficient_balance()]
        } else if (pluginID === NetworkPluginID.PLUGIN_EVM) {
            if (!nonFungibleTokenId || !nonFungibleTokenAddress) return [false]
        } else if (!nonFungibleTokenId) {
            return [false]
        }
        return [true]
    }, [assetType, amount, balance, fungibleToken?.decimals, nonFungibleTokenId, nonFungibleTokenAddress, t])

    return result
}
