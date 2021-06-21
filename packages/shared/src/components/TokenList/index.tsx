import React, { memo, useEffect, useState } from 'react'
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
    const [status, setStatus] = useState<string>()
    const ERC20_TOKEN_LISTS = useConstant(CONSTANTS, 'ERC20_TOKEN_LISTS')
    const { state, tokensDetailed: erc20TokensDetailed } = useERC20TokensDetailedFromTokenLists(ERC20_TOKEN_LISTS)

    const {
        value: assetsDetailedChain = [],
        loading: assetsDetailedChainLoading,
        error: assetsDetailedChainError,
    } = useAssetsFromChain(erc20TokensDetailed)

    const handleSelect = (token: any) => {}

    // todo: convert to status to i18n
    useEffect(() => {
        if (state == TokenListsState.LOADING_TOKEN_LISTS) {
            setStatus('Loading Token List')
            return
        }
        if (state == TokenListsState.LOADING_SEARCHED_TOKEN) {
            setStatus('Searching Token List')
            return
        }
        if (assetsDetailedChainLoading) {
            setStatus('Loading Token Balance')
            return
        }
        if (assetsDetailedChainError) {
            setStatus('Loading Token Balance Failed')
            return
        }

        setStatus('')
    }, [state, assetsDetailedChainLoading, assetsDetailedChainError])

    return (
        <SearchableList<Asset>
            onSelect={handleSelect}
            data={assetsDetailedChain}
            searchKey={['token.address', 'token.symbol']}
            itemRender={TokenInList}
            status={status}
        />
    )
})
