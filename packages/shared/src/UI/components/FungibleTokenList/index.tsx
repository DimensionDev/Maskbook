import {
    ForwardedRef,
    forwardRef,
    memo,
    ReactNode,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react'
import { uniqBy } from 'lodash-unified'
import { EMPTY_LIST, EMPTY_OBJECT, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, MaskFixedSizeListProps, MaskTextFieldProps, SearchableList } from '@masknet/theme'
import { Box, Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../locales/index.js'
import {
    useAccount,
    useBlockedFungibleTokens,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useFungibleAssets,
    useFungibleToken,
    useFungibleTokensBalance,
    useFungibleTokensFromTokenList,
    useTrustedFungibleTokens,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    CurrencyType,
    currySameAddress,
    FungibleToken,
    isSameAddress,
    leftShift,
    minus,
    toZero,
} from '@masknet/web3-shared-base'
import { getFungibleTokenItem } from './FungibleTokenItem.js'
import { ManageTokenListBar } from './ManageTokenListBar.js'
import { TokenListMode } from './type.js'
import { Icons } from '@masknet/icons'

const DEFAULT_LIST_HEIGHT = 300
const SEARCH_KEYS = ['address', 'symbol', 'name']

export interface FungibleTokenListProps<T extends NetworkPluginID> extends withClasses<'channel' | 'bar' | 'listBox'> {
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
    enableManage?: boolean
}

const useStyles = makeStyles()((theme) => ({
    channel: {
        position: 'relative',
    },
    bar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    listBox: {},
}))

const Content = memo(({ message, height }: { message: ReactNode; height?: number | string }) => {
    const h = height ?? DEFAULT_LIST_HEIGHT
    return (
        <Stack
            minHeight={typeof h === 'number' ? h + 52 : h}
            justifyContent="center"
            alignContent="center"
            marginTop="12px">
            <Stack justifyContent="center" gap={1.5} alignItems="center">
                <Icons.EmptySimple size={36} />
                <Typography color="textSecondary" textAlign="center">
                    {message}
                </Typography>
            </Stack>
        </Stack>
    )
})

export const FungibleTokenList = forwardRef(
    <T extends NetworkPluginID>(
        props: FungibleTokenListProps<T>,
        ref: ForwardedRef<{
            updateMode(mode: TokenListMode): void
        }>,
    ) => {
        const {
            tokens = EMPTY_LIST,
            whitelist: includeTokens,
            blacklist: excludeTokens = EMPTY_LIST,
            onSelect,
            FixedSizeListProps,
            selectedTokens = EMPTY_LIST,
            enableManage = false,
        } = props

        const t = useSharedI18N()
        const { classes } = useStyles(undefined, { props: { classes: props.classes } })

        // #region control mode
        const [mode, setMode] = useState(TokenListMode.List)
        const [modeTransition, setModeTransition] = useState(false)

        // should have transition ui for change to manage from list
        useEffect(() => {
            if (mode === TokenListMode.List) return
            setModeTransition(true)
            setTimeout(() => {
                setModeTransition(false)
            }, 800)
        }, [mode])

        useImperativeHandle(
            ref,
            () => ({
                updateMode: (mode: TokenListMode) => {
                    setMode(mode)
                },
                getCurrentMode: () => mode,
            }),
            [mode],
        )
        // #endregion

        const pluginID = useCurrentWeb3NetworkPluginID(props.pluginID) as T
        const account = useAccount(pluginID)
        const chainId = useChainId(pluginID, props.chainId)
        const { Token, Others } = useWeb3State<'all'>(pluginID)
        const { value: fungibleTokens = EMPTY_LIST, loading: loadingFungibleTokens } = useFungibleTokensFromTokenList(
            pluginID,
            { chainId },
        )
        const trustedFungibleTokens = useTrustedFungibleTokens(pluginID, undefined, chainId)
        const blockedFungibleTokens = useBlockedFungibleTokens(pluginID)
        const nativeToken = useMemo(() => Others?.chainResolver.nativeCurrency(chainId), [chainId])

        const filteredFungibleTokens = useMemo(() => {
            const allFungibleTokens = uniqBy(
                [...(nativeToken ? [nativeToken] : []), ...tokens, ...fungibleTokens, ...trustedFungibleTokens],
                (x) => x.address.toLowerCase(),
            )

            return allFungibleTokens.filter(
                (token) =>
                    (!includeTokens || includeTokens.some(currySameAddress(token.address))) &&
                    (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
            )
        }, [nativeToken, tokens, fungibleTokens, trustedFungibleTokens, includeTokens, excludeTokens])

        const { value: fungibleTokensBalance = EMPTY_OBJECT, loading: loadingFungibleTokensBalance } =
            useFungibleTokensBalance(
                pluginID,
                filteredFungibleTokens.map((x) => x.address),
                { account, chainId },
            )

        const { value: fungibleAssets = EMPTY_LIST, loading: loadingFungibleAssets } = useFungibleAssets(
            pluginID,
            undefined,
            {
                chainId,
            },
        )

        // To avoid SearchableList re-render, reduce the dep
        const sortedFungibleTokensForManage = useMemo(() => {
            if (mode === TokenListMode.List) return []
            const isTrustedToken = currySameAddress(trustedFungibleTokens.map((x) => x.address))

            return filteredFungibleTokens.sort((a, z) => {
                // trusted token
                if (isTrustedToken(a.address)) return -1
                if (isTrustedToken(z.address)) return 1

                const isNativeTokenA = isSameAddress(a.address, Others?.getNativeTokenAddress(a.chainId))
                const isNativeTokenZ = isSameAddress(z.address, Others?.getNativeTokenAddress(z.chainId))

                const isMaskTokenA = isSameAddress(a.address, Others?.getMaskTokenAddress(a.chainId))
                const isMaskTokenZ = isSameAddress(z.address, Others?.getMaskTokenAddress(z.chainId))

                // the currently selected chain id
                if (a.chainId !== z.chainId) {
                    if (a.chainId === chainId) return -1
                    if (z.chainId === chainId) return 1
                }

                // native token
                if (isNativeTokenA) return -1
                if (isNativeTokenZ) return 1

                // mask token with position value
                if (isMaskTokenA) return -1
                if (isMaskTokenZ) return 1

                // alphabet
                if (a.name !== z.name) return a.name < z.name ? -1 : 1

                return 0
            })
        }, [chainId, trustedFungibleTokens, Others, mode])

        const sortedFungibleTokensForList = useMemo(() => {
            if (mode === TokenListMode.Manage) return []
            const fungibleAssetsTable = Object.fromEntries(
                fungibleAssets.filter((x) => x.chainId === chainId).map((x) => [x.address, x]),
            )
            const isTrustedToken = currySameAddress(trustedFungibleTokens.map((x) => x.address))
            const isBlockedToken = currySameAddress(blockedFungibleTokens.map((x) => x.address))

            return filteredFungibleTokens
                .filter((x) => !isBlockedToken(x))
                .sort((a, z) => {
                    const aBalance = toZero(leftShift(fungibleTokensBalance[a.address] ?? '0', a.decimals))
                    const zBalance = toZero(leftShift(fungibleTokensBalance[z.address] ?? '0', z.decimals))

                    const aUSD = toZero(fungibleAssetsTable[a.address]?.value?.[CurrencyType.USD] ?? '0')
                    const zUSD = toZero(fungibleAssetsTable[z.address]?.value?.[CurrencyType.USD] ?? '0')

                    const isNativeTokenA = isSameAddress(a.address, Others?.getNativeTokenAddress(a.chainId))
                    const isNativeTokenZ = isSameAddress(z.address, Others?.getNativeTokenAddress(z.chainId))

                    const isMaskTokenA = isSameAddress(a.address, Others?.getMaskTokenAddress(a.chainId))
                    const isMaskTokenZ = isSameAddress(z.address, Others?.getMaskTokenAddress(z.chainId))

                    // the currently selected chain id
                    if (a.chainId !== z.chainId) {
                        if (a.chainId === chainId) return -1
                        if (z.chainId === chainId) return 1
                    }

                    // native token
                    if (isNativeTokenA) return -1
                    if (isNativeTokenZ) return 1

                    // mask token with position value
                    if (aUSD.isPositive() && isMaskTokenA) return -1
                    if (zUSD.isPositive() && isMaskTokenZ) return 1

                    // token value
                    if (!aUSD.isEqualTo(zUSD)) return minus(zUSD, aUSD).isPositive() ? 1 : -1

                    // token balance
                    if (!aBalance.isEqualTo(zBalance)) return minus(zBalance, aBalance).isPositive() ? 1 : -1

                    // trusted token
                    if (isTrustedToken(a.address)) return -1
                    if (isTrustedToken(z.address)) return 1

                    // mask token with position value
                    if (isMaskTokenA) return -1
                    if (isMaskTokenZ) return 1

                    // alphabet
                    if (a.name !== z.name) return a.name < z.name ? -1 : 1

                    return 0
                })
                .map((x) => ({
                    ...x,
                    // To avoid reduce re-render, merge balance into token, when value is `undefined` to represent loading
                    balance: fungibleTokensBalance[x.address],
                }))
        }, [
            chainId,
            fungibleAssets,
            trustedFungibleTokens,
            blockedFungibleTokens,
            filteredFungibleTokens,
            fungibleTokensBalance,
            Others,
        ])

        // #region add token by address
        const [keyword, setKeyword] = useState('')
        const [searchError, setSearchError] = useState<string>()

        const searchedTokenAddress = useMemo(() => {
            if (!keyword) {
                setSearchError(undefined)
                return
            }

            if (
                (keyword.startsWith('0x') || keyword.startsWith('0X')) &&
                keyword.length > 3 &&
                !Others?.isValidAddress(keyword)
            ) {
                setSearchError(t.erc20_search_wrong_address())
                return
            }

            if (mode === TokenListMode.Manage) return ''

            return Others?.isValidAddress(keyword) &&
                !sortedFungibleTokensForList.some((x) => isSameAddress(x.address, keyword))
                ? keyword
                : ''
        }, [keyword, sortedFungibleTokensForList, Others, mode])

        const { value: searchedToken, loading: searchingToken } = useFungibleToken(pluginID, searchedTokenAddress, {
            chainId,
        })
        // #endregion

        const getPlaceholder = () => {
            if (modeTransition) return <Content height={FixedSizeListProps?.height} message={t.token_list_loading()} />

            // Add token in dashboard, includeTokens is empty
            if (Object.keys(fungibleTokensBalance).length === 0 && includeTokens?.length === 0 && !searchedToken)
                return null

            if (
                (Object.keys(fungibleTokensBalance).length === 0 || loadingFungibleTokensBalance) &&
                !searchedToken &&
                !keyword
            )
                return <Content height={FixedSizeListProps?.height} message={t.erc20_token_list_loading()} />

            if (searchingToken)
                return <Content height={FixedSizeListProps?.height} message={t.erc20_search_token_loading()} />

            if (searchedTokenAddress && !searchedToken)
                return <Content height={FixedSizeListProps?.height} message={t.erc20_search_not_token_found()} />

            return null
        }

        const itemRender = useMemo(() => {
            return getFungibleTokenItem<T>(
                (address) => {
                    if (isSameAddress(nativeToken?.address, address)) return 'official-native'

                    const inOfficialList = fungibleTokens.some((x) => isSameAddress(x.address, address))
                    if (inOfficialList) return 'official'

                    const inPersonaList = trustedFungibleTokens.some((x) => isSameAddress(x.address, address))
                    if (inPersonaList) return 'personal'

                    return 'external'
                },
                (address) => selectedTokens.some((x) => isSameAddress(x, address)),
                mode,
                async (
                    token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
                    strategy: 'add' | 'remove',
                ) => {
                    if (strategy === 'add') Token?.addToken?.(account, token)
                    if (strategy === 'remove') Token?.removeToken?.(account, token)
                },
                async (
                    token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
                    strategy: 'trust' | 'block',
                ) => {
                    if (strategy === 'trust') Token?.trustToken?.(account, token)
                    if (strategy === 'block') Token?.blockToken?.(account, token)
                },
            )
        }, [nativeToken?.address, selectedTokens, mode, trustedFungibleTokens, fungibleTokens])

        const SearchFieldProps = useMemo(
            () => ({
                placeholder: t.erc20_token_list_placeholder(),
                helperText: searchError,
                error: !!searchError,
                ...props.SearchTextFieldProps,
            }),
            [searchError, JSON.stringify(props.SearchTextFieldProps)],
        )

        const handleSelect = useCallback(
            (
                token: FungibleToken<
                    Web3Helper.Definition[T]['ChainId'],
                    Web3Helper.Definition[T]['SchemaType']
                > | null,
            ) => onSelect?.(token),
            [onSelect],
        )

        return (
            <Stack className={classes.channel}>
                <SearchableList<
                    FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
                >
                    onSelect={handleSelect}
                    onSearch={setKeyword}
                    data={
                        searchedToken && isSameAddress(searchedToken.address, searchedTokenAddress)
                            ? [searchedToken]
                            : mode === TokenListMode.List
                            ? sortedFungibleTokensForList
                            : sortedFungibleTokensForManage
                    }
                    searchKey={SEARCH_KEYS}
                    disableSearch={!!props.disableSearch}
                    itemKey="address"
                    classes={{ listBox: classes.listBox }}
                    itemRender={itemRender}
                    placeholder={getPlaceholder()}
                    FixedSizeListProps={FixedSizeListProps}
                    SearchFieldProps={SearchFieldProps}
                />
                {mode === TokenListMode.List && enableManage && (
                    <Box className={classes.bar}>
                        <ManageTokenListBar onClick={() => setMode(TokenListMode.Manage)} />
                    </Box>
                )}
            </Stack>
        )
    },
)
