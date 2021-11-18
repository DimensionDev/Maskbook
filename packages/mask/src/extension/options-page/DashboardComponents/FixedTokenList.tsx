import {
    currySameAddress,
    FungibleTokenDetailed,
    makeSortAssertFn,
    makeSortTokenFn,
    useAccount,
    useAssetsByTokenList,
    useChainId,
    useERC20TokenDetailed,
    useERC20TokensDetailedFromTokenLists,
    useEthereumConstants,
    useTrustedERC20Tokens,
    Asset,
    formatBalance,
    isSameAddress,
    resolveTokenLinkOnExplorer,
    useTokenConstants,
    ChainId,
} from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { uniqBy } from 'lodash-es'
import { useMemo, useState } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { useStylesExtends } from '@masknet/shared'
import { EthereumAddress } from 'wallet.ts'
import { Link, ListItemIcon, ListItemText, Typography } from '@mui/material'
import ListItemButton from '@mui/material/ListItemButton'
import { makeStyles } from '@masknet/theme'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useCallback } from 'react'
import { TokenIcon } from '@masknet/shared'
export interface FixedTokenListProps extends withClasses<'list' | 'placeholder'> {
    keyword?: string
    whitelist?: string[]
    blacklist?: string[]
    tokens?: FungibleTokenDetailed[]
    selectedTokens?: string[]
    targetChainId?: ChainId
    onSelect?(token: FungibleTokenDetailed | null): void
    FixedSizeListProps?: Partial<FixedSizeListProps>
}

export function FixedTokenList(props: FixedTokenListProps) {
    const classes = useStylesExtends({}, props)
    const account = useAccount()
    const currentChainId = useChainId()
    const chainId = props.targetChainId ?? currentChainId
    const trustedERC20Tokens = useTrustedERC20Tokens()
    const { t } = useI18N()

    const {
        keyword,
        whitelist: includeTokens = [],
        blacklist: excludeTokens = [],
        selectedTokens = [],
        tokens = [],
        onSelect,
        FixedSizeListProps,
    } = props

    const [address, setAddress] = useState('')
    const { ERC20_TOKEN_LISTS } = useEthereumConstants(chainId)

    const { value: erc20TokensDetailed = [], loading: erc20TokensDetailedLoading } =
        useERC20TokensDetailedFromTokenLists(ERC20_TOKEN_LISTS, keyword, trustedERC20Tokens, chainId)

    //#region add token by address
    const matchedTokenAddress = useMemo(() => {
        if (!keyword || !EthereumAddress.isValid(keyword) || erc20TokensDetailed.length) return
        return keyword
    }, [keyword, erc20TokensDetailed.length])
    const { value: searchedToken, loading: searchedTokenLoading } = useERC20TokenDetailed(matchedTokenAddress ?? '')
    //#endregion

    const filteredTokens = erc20TokensDetailed.filter(
        (token) =>
            (!includeTokens.length || includeTokens.some(currySameAddress(token.address))) &&
            (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    )

    const renderTokens = useMemo(
        () =>
            uniqBy(
                [
                    ...tokens,
                    ...filteredTokens,
                    ...(searchedToken && searchedToken.name !== 'Unknown Token' && searchedToken.symbol !== 'Unknown'
                        ? [searchedToken]
                        : []),
                ],
                (x) => x.address.toLowerCase(),
            ),
        [tokens, filteredTokens, searchedToken],
    )

    const {
        value: assets,
        loading: assetsLoading,
        error: assetsError,
    } = useAssetsByTokenList(
        renderTokens.filter((x) => EthereumAddress.isValid(x.address)),
        chainId,
    )

    const renderAssets =
        !account || assetsError || assetsLoading
            ? [...renderTokens]
                  .sort(makeSortTokenFn(chainId, { isMaskBoost: true }))
                  .map((token) => ({ token: token, balance: null }))
            : !!keyword
            ? assets
            : [...assets].sort(makeSortAssertFn(chainId, { isMaskBoost: true }))

    //#region UI helpers
    const renderPlaceholder = (message: string) => (
        <Typography className={classes.placeholder} color="textSecondary">
            {message}
        </Typography>
    )
    //#endregion

    if (erc20TokensDetailedLoading) return renderPlaceholder('Loading token lists...')
    if (searchedTokenLoading) return renderPlaceholder(t('wallet_loading_token'))
    if (assetsLoading) return renderPlaceholder('Loading token assets...')
    if (!renderAssets.length) return renderPlaceholder(t('wallet_search_contract_no_result'))

    return (
        <FixedSizeList
            className={classes.list}
            width="100%"
            height={100}
            overscanCount={8}
            itemSize={50}
            itemData={{
                assets: renderAssets,
                selected: [address, ...selectedTokens],
                onSelect(token: FungibleTokenDetailed) {
                    setAddress(token.address)
                    onSelect?.(token)
                },
            }}
            itemCount={renderAssets.length}
            {...FixedSizeListProps}>
            {TokenInList}
        </FixedSizeList>
    )
}

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 36,
        height: 36,
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    primary: {
        flex: 1,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        paddingRight: theme.spacing(1),
    },
    name: {
        display: 'block',
    },
    secondary: {
        lineHeight: 1,
        paddingRight: theme.spacing(3),
        position: 'relative',
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 'auto',
        margin: 'auto',
    },
    openIcon: {
        fontSize: 16,
        width: 16,
        height: 16,
        marginLeft: theme.spacing(0.5),
    },
    symbol: {},
}))

interface TokenInListProps {
    index: number
    style: any
    data: {
        assets: Asset[]
        selected: string[]
        onSelect(token: FungibleTokenDetailed): void
    }
}

function TokenInList({ data, index, style }: TokenInListProps) {
    const { classes } = useStyles()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const stop = useCallback((ev: React.MouseEvent<HTMLAnchorElement>) => ev.stopPropagation(), [])

    const currentAsset = data.assets[index]
    const { token, balance } = currentAsset

    if (!token) return null
    const { address, name, symbol, logoURI } = token

    return (
        <ListItemButton
            // force react not to reuse dom node
            key={token.address}
            style={style}
            disabled={data.selected.some(currySameAddress(address))}
            onClick={() => data.onSelect(token)}>
            <ListItemIcon>
                <TokenIcon classes={{ icon: classes.icon }} address={address} name={name} logoURI={logoURI} />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.text }}>
                <Typography className={classes.primary} color="textPrimary" component="span">
                    <span className={classes.symbol}>{symbol}</span>
                    {!isSameAddress(token.address, NATIVE_TOKEN_ADDRESS) ? (
                        <Link
                            className={classes.link}
                            href={resolveTokenLinkOnExplorer(token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}>
                            <OpenInNewIcon className={classes.openIcon} />
                        </Link>
                    ) : null}
                    <Typography className={classes.name} color="textSecondary">
                        {name}
                    </Typography>
                </Typography>
                <Typography className={classes.secondary} color="textPrimary" component="span">
                    {balance !== null && formatBalance(balance, token.decimals, 4)}
                </Typography>
            </ListItemText>
        </ListItemButton>
    )
}
