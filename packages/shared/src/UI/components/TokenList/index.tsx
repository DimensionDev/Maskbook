import React, { memo, useEffect, useState } from 'react'
import { TokenListItem } from './TokenListItem'
import { some } from 'lodash-es'
import type { Asset, FungibleTokenDetailed } from '@masknet/web3-shared'
import { EthereumTokenType, isSameAddress, useERC20Tokens } from '@masknet/web3-shared'
import { SearchableList } from '@masknet/theme'

interface IProps {
    onSelect(asset: Asset): void
    placeholder?: string
    assets: Asset[]
    loading: boolean
}

const checkAddedToken = (token: FungibleTokenDetailed, tokens: FungibleTokenDetailed[]) =>
    token.type === EthereumTokenType.Native || some(tokens, (t: any) => isSameAddress(token.address, t.address))

export const TokenList: React.FC<IProps> = memo(({ onSelect, placeholder, assets, loading }) => {
    const [loadingPlaceholder, setLoadingPlaceholder] = useState(placeholder)
    const tokens = useERC20Tokens()

    const renderAsset = assets.map((x: Asset) => ({ ...x, isAddedToken: checkAddedToken(x.token, tokens) }))

    useEffect(() => {
        setLoadingPlaceholder(loading && loadingPlaceholder ? loadingPlaceholder : '')
    }, [loading])

    return (
        <SearchableList<Asset & { isAddedToken: boolean }>
            onSelect={onSelect}
            data={renderAsset}
            searchKey={['token.address', 'token.symbol', 'token.name']}
            itemRender={TokenListItem}
            placeholder={loadingPlaceholder}
        />
    )
})
