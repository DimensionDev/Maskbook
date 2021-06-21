import React, { memo } from 'react'
import { SearchableList } from '../SearchableList'
import { TokenInList } from './TokenInList'
import {
    Asset,
    CONSTANTS,
    TokenListsState,
    useAssetsFromChain,
    useConstant,
    useERC20TokensDetailedFromTokenLists,
} from '@dimensiondev/web3-shared'

//todo: add retryAssetsDetailedChain
export const TokenList: React.FC = memo(() => {
    const ERC20_TOKEN_LISTS = useConstant(CONSTANTS, 'ERC20_TOKEN_LISTS')
    const { state, tokensDetailed: erc20TokensDetailed } = useERC20TokensDetailedFromTokenLists(ERC20_TOKEN_LISTS)

    const {
        value: assetsDetailedChain = [],
        loading: assetsDetailedChainLoading,
        error: assetsDetailedChainError,
    } = useAssetsFromChain(erc20TokensDetailed)

    const handleSelect = (token: any) => {}

    // todo: update loading status
    if (state == TokenListsState.LOADING_TOKEN_LISTS || assetsDetailedChainLoading) return <span>'Loading'</span>
    if (assetsDetailedChainError) return <span>'Load error'</span>

    return (
        <SearchableList<Asset>
            onSelect={handleSelect}
            data={assetsDetailedChain}
            searchKey={['token.address', 'token.symbol']}
            itemRender={TokenInList}
        />
    )
})
