import { memo, useState } from 'react'
import { uniqBy } from 'lodash-unified'
import { MaskFixedSizeListProps, MaskTextFieldProps, SearchableList } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { useSharedI18N } from '@masknet/shared'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useFungibleAssets,
    useFungibleToken,
    useFungibleTokensFromTokenList,
    useTrustedFungibleTokens,
    useWeb3State,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import {
    CurrencyType,
    currySameAddress,
    FungibleToken,
    isSameAddress,
    NetworkPluginID,
} from '@masknet/web3-shared-base'
import { getFungibleTokenItem } from './FungibleTokenItem'
import { EMPTY_LIST } from '@masknet/shared-base'

import type { ChainAddress } from '../../../types'
import { useI18N } from '../../../locales'

const DEFAULT_LIST_HEIGHT = 300
const SEARCH_KEYS = ['address', 'symbol', 'name']

export interface FungibleTokenListProps<T extends NetworkPluginID> extends withClasses<'list' | 'placeholder'> {
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    whitelist?: string[]
    blacklist?: string[]
    tokens?: Array<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    selectedTokens?: string[]
    disableSearch?: boolean
    onSelect?(
        token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']> | null,
    ): void
    FixedSizeListProps?: Partial<MaskFixedSizeListProps>
    SearchTextFieldProps?: MaskTextFieldProps
    loading: boolean
    referredTokensDefn: ChainAddress[]
}

const Placeholder = memo(({ message, height }: { message: string; height?: number | string }) => (
    <Stack minHeight={height ?? DEFAULT_LIST_HEIGHT} justifyContent="center" alignContent="center" marginTop="12px">
        <Typography color="textSecondary" textAlign="center">
            {message}
        </Typography>
    </Stack>
))

export function FungibleTokenList<T extends NetworkPluginID>(props: FungibleTokenListProps<T>) {
    const {
        tokens = [],
        whitelist: includeTokens,
        blacklist: excludeTokens = [],
        onSelect,
        FixedSizeListProps,
        selectedTokens = [],
        referredTokensDefn = [],
    } = props

    const t = useSharedI18N()
    const tReferral = useI18N()
    const pluginID = useCurrentWeb3NetworkPluginID(props.pluginID)
    const account = useAccount()
    const chainId = useChainId(pluginID, props.chainId)
    const { Token, Others } = useWeb3State() as Web3Helper.Web3StateAll
    const { value: fungibleTokens = EMPTY_LIST } = useFungibleTokensFromTokenList()
    const trustedFungibleTokens = useTrustedFungibleTokens()

    const nativeToken = Others?.chainResolver.nativeCurrency(chainId)
    const allFungibleTokens = uniqBy(
        [...(nativeToken ? [nativeToken] : []), ...tokens, ...fungibleTokens, ...trustedFungibleTokens],
        (x) => x.address.toLowerCase(),
    )

    const filteredFungibleTokens = allFungibleTokens.filter(
        (token) =>
            (!includeTokens || includeTokens.some(currySameAddress(token.address))) &&
            (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    )

    const { value: fungibleAssets = [], loading: fungibleAssetsLoading } = useFungibleAssets(pluginID)
    const fungibleAssetsTable = Object.fromEntries(fungibleAssets.map((x) => [x.address, x]))

    const sortedFungibleTokens = filteredFungibleTokens.sort((a, b) => {
        // tokens belong to the current chain
        if (a.chainId !== b.chainId) {
            if (a.chainId === chainId) return -1
            if (b.chainId === chainId) return 1
        }

        // native token
        if (isSameAddress(a.address, Others?.getNativeTokenAddress(a.chainId))) return -1
        if (isSameAddress(b.address, Others?.getNativeTokenAddress(b.chainId))) return 1

        // usd value
        const aValueInUSD = Number.parseFloat(fungibleAssetsTable[a.address]?.value?.[CurrencyType.USD] ?? '0')
        const bValueInUSD = Number.parseFloat(fungibleAssetsTable[b.address]?.value?.[CurrencyType.USD] ?? '0')
        if (aValueInUSD > bValueInUSD) return -1
        if (aValueInUSD < bValueInUSD) return 1

        // TODO: add daily reward
        // balance
        // const aBalance = Number.parseFloat(formatBalance(fungibleTokensBalance[a.address] ?? '0', a.decimals))
        // const bBalance = Number.parseFloat(formatBalance(fungibleTokensBalance[b.address] ?? '0', b.decimals))

        // if (aBalance > bBalance) return -1
        // if (aBalance < bBalance) return 1

        // mask token
        if (isSameAddress(a.address, Others?.getMaskTokenAddress(a.chainId))) return -1
        if (isSameAddress(b.address, Others?.getMaskTokenAddress(b.chainId))) return 1

        // alphabet
        if ((a.name ?? '') < (b.name ?? '')) return -1
        if ((a.name ?? '') > (b.name ?? '')) return 1

        return 0
    })

    // #region add token by address
    const [keyword, setKeyword] = useState('')
    const searchedTokenAddress =
        Others?.isValidAddress(keyword) && !sortedFungibleTokens.some((x) => isSameAddress(x.address, keyword))
            ? keyword
            : ''

    const { value: searchedToken, loading: searchedTokenLoading } = useFungibleToken(pluginID, searchedTokenAddress)
    // #endregion

    const getPlaceholder = () => {
        if (!filteredFungibleTokens.length) {
            return <Placeholder height={FixedSizeListProps?.height} message={tReferral.placeholder_no_farms()} />
        }
        if (searchedTokenLoading)
            return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_search_token_loading()} />
        if (searchedTokenAddress && !searchedToken)
            return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_search_not_token_found()} />
        return null
    }

    return (
        <SearchableList<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
            onSelect={(token) => onSelect?.(token)}
            data={
                searchedToken &&
                isSameAddress(searchedToken.address, searchedTokenAddress) &&
                !sortedFungibleTokens.find((x) => isSameAddress(x.address, searchedTokenAddress))
                    ? [searchedToken]
                    : sortedFungibleTokens
            }
            searchKey={SEARCH_KEYS}
            disableSearch={!!props.disableSearch}
            itemRender={getFungibleTokenItem<T>(
                account,
                (address) => {
                    if (isSameAddress(nativeToken?.address, address)) return 'official'

                    const inOfficialList = fungibleTokens.some((x) => isSameAddress(x.address, address))
                    if (inOfficialList) return 'official'

                    const inPersonaList = trustedFungibleTokens.some((x) => isSameAddress(x.address, address))
                    if (inPersonaList) return 'personal'

                    return 'external'
                },
                (address) => '0',
                (address) => selectedTokens.some((x) => isSameAddress(x, address)),
                (address) => fungibleAssetsLoading,
                async (
                    token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
                ) => {
                    await Token?.addToken?.(token)
                    await Token?.trustToken?.(account, token)
                },
                referredTokensDefn,
            )}
            placeholder={getPlaceholder()}
            FixedSizeListProps={FixedSizeListProps}
            SearchFieldProps={{
                placeholder: t.erc20_token_list_placeholder(),
                ...props.SearchTextFieldProps,
            }}
        />
    )
}
