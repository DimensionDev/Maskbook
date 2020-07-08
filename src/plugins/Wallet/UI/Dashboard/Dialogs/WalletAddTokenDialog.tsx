import React, { useCallback, useState, useEffect, CSSProperties } from 'react'
import Fuse from 'fuse.js'
import TextField from '@material-ui/core/TextField'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { FixedSizeList } from 'react-window'
import contractMap, { TokenMetadata } from 'eth-contract-metadata'
import {
    Switch,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Box,
    Typography,
    Avatar,
    ListItemIcon,
} from '@material-ui/core'
import type { ERC20Token } from '../../../token'
import { EthereumNetwork } from '../../../database/types'
import Wallet from 'wallet.ts'

//#region predefined tokens
import mainnet from '../../../erc20/mainnet.json'
import rinkeby from '../../../erc20/rinkeby.json'

const sort = (x: ERC20Token, y: ERC20Token): 1 | -1 => {
    return [x.name, y.name].sort()[0] === x.name ? -1 : 1
}
mainnet.sort(sort)
rinkeby.sort(sort)
//#endregion

//#region token selector
const useListItemStyles = makeStyles((theme) => ({
    root: { padding: 0 },
    listItemSecondaryAction: {
        right: 0,
    },
}))

interface EthereumNetworkSelectorProps {
    network?: EthereumNetwork
    onNetworkChange: (network: EthereumNetwork) => void
    children?: React.ReactNode
}

function EthereumNetworkSelector({
    network = EthereumNetwork.Mainnet,
    onNetworkChange,
    children,
}: EthereumNetworkSelectorProps) {
    const listItemClasses = useListItemStyles()

    const onChange = useCallback(() => {
        if (network !== EthereumNetwork.Rinkeby) onNetworkChange(EthereumNetwork.Rinkeby)
    }, [network, onNetworkChange])

    return (
        <Box textAlign="left">
            {process.env.NODE_ENV !== 'development' ? (
                <List disablePadding>
                    <ListItem classes={{ root: listItemClasses.root }} onClick={onChange}>
                        <ListItemText primary="Use Rinkeby Network"></ListItemText>
                        <ListItemSecondaryAction classes={{ root: listItemClasses.listItemSecondaryAction }}>
                            <Switch
                                onClick={onChange}
                                checked={network === EthereumNetwork.Rinkeby}
                                color="primary"
                                edge="end"
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            ) : null}
            {children}
        </Box>
    )
}
//#endregion

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
    style: CSSProperties
    data: {
        tokens: (TokenMetadata & {
            address: string
        })[]
        excludeTokens: string[]
        selected: string
        onSelect: (address: string) => void
    }
}

function TokenInList({ data, index, style }: TokenInListProps) {
    const { address, name, symbol, logo } = data.tokens[index]
    const classes = useTokenInListStyles()
    return (
        <ListItem
            button
            style={style}
            disabled={data.excludeTokens.includes(address)}
            selected={data.selected === address}
            onClick={() => data.onSelect(address)}>
            <ListItemIcon>
                <Avatar
                    className={classes.icon}
                    src={`https://rawcdn.githack.com/MetaMask/eth-contract-metadata/ec5be3ac38685e4d365e7d076d122370ed2298f7/images/${logo}`}
                />
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
const erc20Tokens = Object.entries(contractMap)
    .map(([address, token]) => ({
        ...token,
        address,
    }))
    .filter((token) => token.erc20)
const fuse = new Fuse(erc20Tokens, {
    shouldSort: true,
    threshold: 0.45,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        { name: 'name', weight: 0.5 },
        { name: 'symbol', weight: 0.5 },
    ],
})

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

export interface ERC20PredefinedTokenSelectorProps extends EthereumNetworkSelectorProps {
    excludeTokens?: string[]
    onTokenChange?: (next: ERC20Token | null) => void
}

export function ERC20PredefinedTokenSelector({
    onTokenChange,
    excludeTokens = [],
    ...props
}: ERC20PredefinedTokenSelectorProps) {
    const classes = useERC20PredefinedTokenSelectorStyles()
    const [address, setAddress] = useState('')
    const [query, setQuery] = useState('')
    const [tokens, setTokens] = useState<typeof erc20Tokens[0][]>([])
    useEffect(() => {
        setTokens(
            query
                ? [
                      ...erc20Tokens.filter((token) => token.address.toLowerCase() === query.toLowerCase()),
                      ...fuse.search(query).map((x) => x.item),
                  ]
                : [],
        )
    }, [query])

    return (
        <EthereumNetworkSelector {...props}>
            <TextField
                className={classes.search}
                label="Search ERC20 Tokens"
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
        </EthereumNetworkSelector>
    )
}
//#endregion

//#region ERC20 customized token selector
export interface ERC20CustomizedTokenSelectorProps extends EthereumNetworkSelectorProps {
    onTokenChange?: (next: ERC20Token | null) => void
    excludeTokens?: string[]
}

export function ERC20CustomizedTokenSelector({ onTokenChange, ...props }: ERC20CustomizedTokenSelectorProps) {
    const [address, setAddress] = useState('')
    const [decimals, setDecimal] = useState(0)
    const [name, setName] = useState('')
    const [symbol, setSymbol] = useState('')
    const isValidAddress = Wallet.EthereumAddress.isValid(address)

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
        <EthereumNetworkSelector {...props}>
            <TextField
                required
                error={!isValidAddress && !!address}
                label="Contract Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
                required
                label="Decimal"
                value={decimals === 0 ? '' : decimals}
                type="number"
                inputProps={{ min: 0 }}
                onChange={(e) => setDecimal(parseInt(e.target.value))}
            />
            <TextField required label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField required label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        </EthereumNetworkSelector>
    )
}
//#endregion
