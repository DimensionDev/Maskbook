import { useState } from 'react'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TrendingPopper } from './TrendingPopper.js'
import { TrendingView } from './TrendingView.js'
import { decentralizedSearchSettings } from '../../../../../shared/legacy-settings/settings.js'
import { useValueRef } from '@masknet/shared-base-ui'
import { TrendingViewProvider } from './context.js'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    const dSearchEnabled = useValueRef(decentralizedSearchSettings)

    if (!dSearchEnabled) return null

    return (
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
            <TrendingPopper>
                {(resultList, address, isNFTProjectPopper) => (
                    <TrendingViewWrapper
                        address={address}
                        resultList={resultList}
                        isNFTProjectPopper={isNFTProjectPopper}
                    />
                )}
            </TrendingPopper>
        </Web3ContextProvider>
    )
}

interface TrendingViewWrapperProps {
    resultList: Web3Helper.TokenResultAll[]
    address?: string
    isNFTProjectPopper?: boolean
}

function TrendingViewWrapper({ resultList, address, isNFTProjectPopper }: TrendingViewWrapperProps) {
    const [result, setResult] = useState<Web3Helper.TokenResultAll>()
    const current = result ?? resultList[0]
    return (
        <TrendingViewProvider
            isNFTProjectPopper={Boolean(isNFTProjectPopper)}
            isProfilePage={false}
            isTokenTagPopper={!isNFTProjectPopper}
            isPreciseSearch={false}>
            <TrendingView setResult={setResult} result={current} resultList={resultList} address={address} />
        </TrendingViewProvider>
    )
}
