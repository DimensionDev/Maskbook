import { memo, useMemo, useState } from 'react'
import { uniqBy } from 'lodash-unified'

import { useI18N } from '../../../../utils'
import {
    Asset,
    ChainId,
    currySameAddress,
    FungibleTokenDetailed,
    isSameAddress,
    isValidAddress,
    makeSortAssertFn,
    makeSortTokenFn,
    useAccount,
    useAssetsByTokenList,
    useChainId,
    useERC20TokenDetailed,
    useERC20TokensDetailedFromTokenLists,
    useTokenListConstants,
    useNativeTokenDetailed,
    useTrustedERC20Tokens,
} from '@masknet/web3-shared-evm'
import { EMPTY_LIST } from '@masknet/shared-base'
import { MaskFixedSizeListProps, MaskTextFieldProps, makeStyles, MaskColorVar } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { SearchableList } from './SearchableList'
import { getERC20TokenListItem } from './ERC20TokenListItem'
import type { ChainAddress } from '../../types'

const DEFAULT_LIST_HEIGHT = 300

export interface ERC20TokenListProps extends withClasses<'list' | 'placeholder'> {
    targetChainId?: ChainId
    whitelist?: string[]
    blacklist?: string[]
    renderList?: string[]
    tokens?: FungibleTokenDetailed[]
    selectedTokens?: string[]
    disableSearch?: boolean
    onSelect?(token: FungibleTokenDetailed | null): void
    FixedSizeListProps?: Partial<MaskFixedSizeListProps>
    SearchTextFieldProps?: MaskTextFieldProps
    dataLoading?: boolean
    referredTokensDefn: ChainAddress[]
    excludeProportionalFarms?: boolean
}

const Placeholder = memo(({ message, height }: { message: string; height?: number | string }) => (
    <Stack minHeight={height ?? DEFAULT_LIST_HEIGHT} justifyContent="center" alignContent="center" marginTop="12px">
        <Typography color="textSecondary" textAlign="center">
            {message}
        </Typography>
    </Stack>
))

const useStyles = makeStyles()((theme) => ({
    search: {
        backgroundColor: 'transparent !important',
        border: `solid 1px ${MaskColorVar.twitterBorderLine}`,
    },
}))

export const ERC20TokenList = memo<ERC20TokenListProps>((props) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const account = useAccount()
    const currentChainId = useChainId()
    const chainId = props.targetChainId ?? currentChainId
    const trustedERC20Tokens = useTrustedERC20Tokens()
    const { value: nativeToken } = useNativeTokenDetailed(chainId)

    const [keyword, setKeyword] = useState('')
    const {
        whitelist: includeTokens,
        blacklist: excludeTokens = EMPTY_LIST,
        renderList = EMPTY_LIST,
        tokens = EMPTY_LIST,
        onSelect,
        FixedSizeListProps,
        selectedTokens = EMPTY_LIST,
        dataLoading,
    } = props

    const { ERC20 } = useTokenListConstants(chainId)

    const { value: erc20TokensDetailed = EMPTY_LIST, loading: erc20TokensDetailedLoading } =
        useERC20TokensDetailedFromTokenLists(
            ERC20,
            keyword,
            nativeToken ? [...trustedERC20Tokens, nativeToken] : trustedERC20Tokens,
            chainId,
        )

    // #region add token by address
    const matchedTokenAddress = useMemo(() => {
        if (!keyword || !isValidAddress(keyword) || erc20TokensDetailedLoading) return
        return keyword
    }, [keyword, erc20TokensDetailedLoading])

    const { value: searchedToken, loading: searchedTokenLoading } = useERC20TokenDetailed(matchedTokenAddress ?? '')
    // #endregion

    // filter by renderList
    let filteredTokens = renderList.length
        ? erc20TokensDetailed.filter((token) => renderList.some(currySameAddress(token.address)))
        : erc20TokensDetailed

    // filter by includeTokens and excludeTokens
    filteredTokens = filteredTokens.filter(
        (token) =>
            (!includeTokens || includeTokens.some(currySameAddress(token.address))) &&
            (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    )

    const renderTokens = uniqBy([...tokens, ...filteredTokens, ...(searchedToken ? [searchedToken] : [])], (x) =>
        x.address.toLowerCase(),
    )

    const {
        value: assets,
        loading: assetsLoading,
        error: assetsError,
        retry: retryLoadAsset,
    } = useAssetsByTokenList(
        renderTokens.filter((x) => isValidAddress(x.address)),
        chainId,
    )

    const renderAssets =
        !account || !!assetsError || assetsLoading || searchedTokenLoading
            ? [...renderTokens]
                  .sort(makeSortTokenFn(chainId, { isMaskBoost: true }))
                  .map((token) => ({ token: token, balance: null }))
            : keyword
            ? assets
            : [...assets].sort(makeSortAssertFn(chainId, { isMaskBoost: true }))

    return (
        <SearchableList<Asset>
            SearchFieldProps={{
                placeholder: t('plugin_referral_search_placeholder_token'),
                InputProps: {
                    classes: { root: classes.search },
                },
            }}
            onSelect={(asset) => onSelect?.(asset.token)}
            disableSearch={!!props.disableSearch}
            onSearch={setKeyword}
            data={renderAssets as Asset[]}
            searchKey={['token.address', 'token.symbol', 'token.name']}
            itemRender={getERC20TokenListItem(
                trustedERC20Tokens,
                searchedToken ? [searchedToken] : [],
                searchedToken
                    ? [...tokens, ...erc20TokensDetailed].find((x) => isSameAddress(x.address, searchedToken.address))
                        ? { from: 'search', inList: true }
                        : { from: 'search', inList: false }
                    : { from: 'defaultList', inList: true },
                selectedTokens,
                assetsLoading,
                props.referredTokensDefn,
            )}
            placeholder={
                dataLoading ||
                (erc20TokensDetailedLoading && (
                    <Placeholder
                        height={FixedSizeListProps?.height}
                        message={t('plugin_referral_placeholder_loading')}
                    />
                ))
            }
            FixedSizeListProps={FixedSizeListProps}
        />
    )
})
