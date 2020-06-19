import React, { useCallback, useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete, { RenderGroupParams } from '@material-ui/lab/Autocomplete'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import ListSubheader from '@material-ui/core/ListSubheader'
import { useTheme, makeStyles } from '@material-ui/core/styles'
import { VariableSizeList, ListChildComponentProps } from 'react-window'
import { Typography, Switch, List, ListItem, ListItemText, ListItemSecondaryAction, Box } from '@material-ui/core'
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
        if (network !== EthereumNetwork.Rinkeby) {
            onNetworkChange(EthereumNetwork.Rinkeby)
        }
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
//#region

//#region list box component
const LISTBOX_PADDING = 8 // px
const OuterElementContext = React.createContext({})

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext)
    return <div ref={ref} {...props} {...outerProps} />
})

const renderRow = ({ data, index, style }: ListChildComponentProps) =>
    React.cloneElement(data[index], {
        style: {
            ...style,
            top: (style.top as number) + LISTBOX_PADDING,
        },
    })

const ListboxComponent = React.forwardRef<HTMLDivElement>(function ListboxComponent(props, ref) {
    const { children, ...other } = props
    const itemData = React.Children.toArray(children)
    const theme = useTheme()
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true })
    const itemCount = itemData.length
    const itemSize = smUp ? 36 : 48

    const getChildSize = (child: React.ReactNode) => {
        if (React.isValidElement(child) && child.type === ListSubheader) {
            return 48
        }

        return itemSize
    }

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0)
    }

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight() + 2 * LISTBOX_PADDING}
                    width="100%"
                    key={itemCount}
                    outerElementType={OuterElementType}
                    innerElementType="ul"
                    itemSize={(index) => getChildSize(itemData[index])}
                    overscanCount={5}
                    itemCount={itemCount}>
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    )
})
//#endregion

//#region predefined token selector
const useAutoCompleteStyles = makeStyles({
    listbox: {
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
})

const getNameOfToken = (x: typeof mainnet[0]) => (x.name + ` (${x.symbol})`).replace(/^ +/g, '')

const renderGroup = (params: RenderGroupParams) => [
    <ListSubheader key={params.key} component="div">
        {params.group}
    </ListSubheader>,
    params.children,
]

export interface ERC20PredefinedTokenSelectorProps extends EthereumNetworkSelectorProps {
    token?: ERC20Token | null
    excludeTokens?: string[]
    onTokenChange?: (next: ERC20Token | null) => void
}

export function ERC20PredefinedTokenSelector({
    token = null,
    onTokenChange,
    excludeTokens = [],
    ...props
}: ERC20PredefinedTokenSelectorProps) {
    const autoCompleteClasses = useAutoCompleteStyles()
    const tokens = props.network === EthereumNetwork.Rinkeby ? rinkeby : mainnet

    return (
        <EthereumNetworkSelector {...props}>
            <Autocomplete
                disableListWrap
                classes={autoCompleteClasses}
                ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
                renderGroup={renderGroup}
                options={tokens.filter((token) => !excludeTokens.includes(token.address))}
                getOptionLabel={(option: typeof mainnet[0]) => option.name + ` (${option.symbol})`}
                groupBy={(option: typeof mainnet[0]) => getNameOfToken(option)[0]}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Predefined ERC20 Tokens" fullWidth />
                )}
                renderOption={(option: typeof mainnet[0]) => (
                    <Typography key={option.address} noWrap>
                        {getNameOfToken(option)}
                    </Typography>
                )}
                value={token}
                onChange={(_: React.ChangeEvent<{}>, token: typeof mainnet[0] | null) => onTokenChange?.(token)}
            />
            {token ? <ERC20TokenPreviewCard token={token}></ERC20TokenPreviewCard> : null}
        </EthereumNetworkSelector>
    )
}
//#endregion

//#region ERC20 customized token selector
export interface ERC20CustomizedTokenSelectorProps extends EthereumNetworkSelectorProps {
    token?: ERC20Token | null
    onTokenChange?: (next: ERC20Token | null) => void
    excludeTokens?: string[]
}

export function ERC20CustomizedTokenSelector({ token, onTokenChange, ...props }: ERC20CustomizedTokenSelectorProps) {
    const [address, setAddress] = useState(() => token?.address ?? '')
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
        // TODO:
        // name, symbol, decimals are optional methods since we cannot get those settings info
        // from web3.js. We can remove fields exclude address if we find a stable way
        // for fetching ERC20 token settings
        <EthereumNetworkSelector {...props}>
            <>
                <TextField
                    required
                    error={!isValidAddress && !!address}
                    label="Contract Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}></TextField>
                <TextField
                    required
                    label="Decimal"
                    value={decimals === 0 ? '' : decimals}
                    type="number"
                    inputProps={{ min: 0 }}
                    onChange={(e) => setDecimal(parseInt(e.target.value))}></TextField>
                <TextField required label="Name" value={name} onChange={(e) => setName(e.target.value)}></TextField>
                <TextField
                    required
                    label="Symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}></TextField>
            </>
        </EthereumNetworkSelector>
    )
}
//#endregion

//#region ERC20 token preview
export interface ERC20TokenPreviewCardProps {
    token: ERC20Token
}

export function ERC20TokenPreviewCard({ token }: ERC20TokenPreviewCardProps) {
    return (
        <Box display="flex" flexDirection="column" alignItems="flex-start">
            {token.name ? (
                <Typography component="p" style={{ marginTop: 8 }} variant="caption">
                    Name: {token.name} {token.symbol ? `(${token.symbol})` : ''}
                </Typography>
            ) : null}
            {token.address ? (
                <Typography component="p" variant="caption">
                    Address: {token.address}
                </Typography>
            ) : null}
            {token.decimals ? (
                <Typography component="p" variant="caption">
                    Decimals: {token.decimals}
                </Typography>
            ) : null}
        </Box>
    )
}
//#endregion
