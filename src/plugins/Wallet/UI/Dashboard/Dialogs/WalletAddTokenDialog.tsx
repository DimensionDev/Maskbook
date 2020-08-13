import React, { useState, useEffect, CSSProperties, useMemo } from 'react'
import Fuse from 'fuse.js'
import TextField from '@material-ui/core/TextField'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { FixedSizeList } from 'react-window'
import { ListItem, ListItemText, Box, Typography, ListItemIcon } from '@material-ui/core'
import type { ERC20Token } from '../../../token'
import { EthereumAddress } from 'wallet.ts'
import { getNetworkERC20Tokens } from '../../Developer/EthereumNetworkSettings'
import { TokenIcon } from '../../../../../extension/options-page/DashboardComponents/TokenIcon'
import { useI18N } from '../../../../../utils/i18n-next-ui'
import { useCurrentEthChain } from '../../../../shared/useWallet'

//#region token
const useTokenInListStyles = makeStyles((theme) =>
    createStyles({
        icon: {
            width: 28,
            height: 28,
            marginRight: theme.spacing(1),
        },
        text: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        primary: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            paddingRight: theme.spacing(1),
        },
    }),
)

interface TokenInListProps {
    index: number
    style: any
    data: {
        tokens: ERC20Token[]
        excludeTokens: string[]
        selected: string
        onSelect: (address: string) => void
    }
}

function TokenInList({ data, index, style }: TokenInListProps) {
    const { address, name, symbol } = data.tokens[index]
    const classes = useTokenInListStyles()
    return (
        <ListItem
            button
            style={style}
            disabled={data.excludeTokens.includes(address)}
            selected={data.selected === address}
            onClick={() => data.onSelect(address)}>
            <ListItemIcon>
                <TokenIcon classes={{ coin: classes.icon }} address={address} name={name} />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.text }}>
                <Typography className={classes.primary} color="textPrimary" component="span">
                    {name}
                </Typography>
                <Typography color="textSecondary" component="span">
                    {symbol}
                </Typography>
            </ListItemText>
        </ListItem>
    )
}
//#endregion

//#region predefined token selector
const useERC20PredefinedTokenSelectorStyles = makeStyles((theme) =>
    createStyles({
        list: {
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        search: {
            marginBottom: theme.spacing(1),
        },
    }),
)

export interface ERC20PredefinedTokenSelectorProps {
    excludeTokens?: string[]
    onTokenChange?: (next: ERC20Token | null) => void
}

export function ERC20PredefinedTokenSelector({ onTokenChange, excludeTokens = [] }: ERC20PredefinedTokenSelectorProps) {
    const { t } = useI18N()
    const network = useCurrentEthChain()
    const [erc20Tokens, fuse] = useMemo(() => {
        const tokens = getNetworkERC20Tokens(network)
        const fuse = new Fuse(tokens, {
            shouldSort: true,
            threshold: 0.45,
            minMatchCharLength: 1,
            keys: [
                { name: 'name', weight: 0.5 },
                { name: 'symbol', weight: 0.5 },
            ],
        })
        return [tokens, fuse] as const
    }, [network])

    const classes = useERC20PredefinedTokenSelectorStyles()
    const [address, setAddress] = useState('')
    const [query, setQuery] = useState('')
    const [tokens, setTokens] = useState<ERC20Token[]>([])
    useEffect(() => {
        setTokens(
            query
                ? [
                      ...erc20Tokens.filter((token) => token.address.toLowerCase() === query.toLowerCase()),
                      ...fuse.search(query).map((x) => x.item),
                  ]
                : [],
        )
    }, [erc20Tokens, fuse, query])

    return (
        <Box textAlign="left">
            <TextField
                className={classes.search}
                label={t('add_token_search_hint')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <FixedSizeList
                className={classes.list}
                key={tokens.length}
                width="100%"
                height={192}
                overscanCount={2}
                itemSize={48}
                itemData={{
                    tokens,
                    excludeTokens,
                    selected: address,
                    onSelect(address: string) {
                        const token = tokens.find((token) => token.address === address)
                        if (!token) return
                        setAddress(address)
                        onTokenChange?.({
                            address,
                            name: token.name,
                            symbol: token.symbol,
                            decimals: token.decimals,
                        })
                    },
                }}
                itemCount={tokens.length}>
                {TokenInList}
            </FixedSizeList>
        </Box>
    )
}
//#endregion

//#region ERC20 customized token selector
export interface ERC20CustomizedTokenSelectorProps {
    onTokenChange?: (next: ERC20Token | null) => void
    excludeTokens?: string[]
}

export function ERC20CustomizedTokenSelector({ onTokenChange, ...props }: ERC20CustomizedTokenSelectorProps) {
    const { t } = useI18N()
    const [address, setAddress] = useState('')
    const [decimals, setDecimal] = useState(0)
    const [name, setName] = useState('')
    const [symbol, setSymbol] = useState('')
    const isValidAddress = EthereumAddress.isValid(address)

    useEffect(() => {
        if (isValidAddress)
            onTokenChange?.({
                address,
                decimals,
                name,
                symbol,
            })
        else onTokenChange?.(null)
    }, [address, decimals, isValidAddress, name, symbol, onTokenChange])
    return (
        <Box textAlign="left">
            <TextField
                required
                error={!isValidAddress && !!address}
                label={t('add_token_contract_address')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
                required
                label={t('add_token_decimals')}
                value={decimals === 0 ? '' : decimals}
                type="number"
                inputProps={{ min: 0 }}
                onChange={(e) => setDecimal(parseInt(e.target.value))}
            />
            <TextField required label={t('add_token_name')} value={name} onChange={(e) => setName(e.target.value)} />
            <TextField
                required
                label={t('add_token_symbol')}
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
            />
        </Box>
    )
}
//#endregion
