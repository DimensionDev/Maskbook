import React, { memo, useEffect, useState } from 'react'
import { SearchableList } from '@dimensiondev/maskbook-theme'
import { TokenListItem } from './TokenListItem'
import {
    Asset,
    EthereumTokenType,
    FungibleTokenDetailed,
    isSameAddress,
    useTrustedERC20TokensFromDB,
} from '@dimensiondev/web3-shared'
import { some } from 'lodash-es'
import { useERC20TokensDetailed } from '../../pages/Wallets/hooks/useERC20TokensDetailed'
import { useDashboardI18N } from '../../locales'

interface IProps {
    onSelect(asset: Asset): void
}

const isImportedToken = (token: FungibleTokenDetailed, tokens: FungibleTokenDetailed[]) =>
    token.type === EthereumTokenType.Native || some(tokens, (t: any) => isSameAddress(token.address, t.address))

export const TokenList: React.FC<IProps> = memo(({ onSelect }) => {
    const t = useDashboardI18N()
    const [placeholder, setPlaceholder] = useState('')
    const tokens = useTrustedERC20TokensFromDB()

    const { loading, value: assets } = useERC20TokensDetailed()
    const renderAsset = assets.map((x) => ({ ...x, isImported: isImportedToken(x.token, tokens) }))

    useEffect(() => {
        setPlaceholder(loading ? t.wallets_loading_token() : '')
    }, [loading])

    return (
        <SearchableList<Asset & { isImported: boolean }>
            onSelect={onSelect}
            data={renderAsset}
            searchKey={['token.address', 'token.symbol', 'token.name']}
            itemRender={TokenListItem}
            placeholder={placeholder}
        />
    )
})
