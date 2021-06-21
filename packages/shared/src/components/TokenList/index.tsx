import React, { memo, useEffect, useState } from 'react'
import { SearchableList } from '../SearchableList'
import { TokenInList } from './TokenInList'
import {
    Asset,
    CONSTANTS,
    EthereumTokenType,
    isSameAddress,
    TokenListsState,
    useAssetsFromChain,
    useConstant,
    useERC20TokensDetailedFromTokenLists,
    useNativeTokenDetailed,
} from '@dimensiondev/web3-shared'
import { uniqBy } from 'lodash-es'

//todo: add retryAssetsDetailedChain
export const TokenList: React.FC = memo(() => {
    const [status, setStatus] = useState<string>()
    const ERC20_TOKEN_LISTS = useConstant(CONSTANTS, 'ERC20_TOKEN_LISTS')
    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    const { state, tokensDetailed: erc20TokensDetailed } = useERC20TokensDetailedFromTokenLists(ERC20_TOKEN_LISTS)

    //#region mask token
    const MASK_ADDRESS = useConstant(CONSTANTS, 'MASK_ADDRESS')
    //#endregion

    const renderAsset = uniqBy(
        nativeTokenDetailed ? [nativeTokenDetailed, ...erc20TokensDetailed] : [...erc20TokensDetailed],
        (x) => x.address.toLowerCase(),
    ).sort((a, z) => {
        if (a.type === EthereumTokenType.Native) return -1
        if (z.type === EthereumTokenType.Native) return 1
        if (isSameAddress(a.address, MASK_ADDRESS)) return -1
        if (isSameAddress(z.address, MASK_ADDRESS)) return 1
        return 0
    })

    const {
        value: assetsDetailedChain = [],
        loading: assetsDetailedChainLoading,
        error: assetsDetailedChainError,
    } = useAssetsFromChain(renderAsset)

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
