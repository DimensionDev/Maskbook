import React, { useCallback, useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete, { RenderGroupParams } from '@material-ui/lab/Autocomplete'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import ListSubheader from '@material-ui/core/ListSubheader'
import { useTheme, makeStyles } from '@material-ui/core/styles'
import { VariableSizeList, ListChildComponentProps } from 'react-window'
import { Typography, Switch, List, ListItem, ListItemText, ListItemSecondaryAction, Box } from '@material-ui/core'
import type { ERC20TokenPredefinedData } from '../../../erc20'
import Wallet from 'wallet.ts'

const LISTBOX_PADDING = 8 // px

function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props
    return React.cloneElement(data[index], {
        style: {
            ...style,
            top: (style.top as number) + LISTBOX_PADDING,
        },
    })
}

const OuterElementContext = React.createContext({})

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext)
    return <div ref={ref} {...props} {...outerProps} />
})

// Adapter for react-window
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

const useListItemStyles = makeStyles((theme) => ({
    root: { padding: 0 },
    listItemSecondaryAction: {
        right: 0,
    },
}))

const useAutoCompleteStyles = makeStyles({
    listbox: {
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
})

import mainnet from '../../../erc20/mainnet.json'
import rinkeby from '../../../erc20/rinkeby.json'
const sort = (x: ERC20TokenPredefinedData[0], y: ERC20TokenPredefinedData[0]): 1 | -1 => {
    return [x.name, y.name].sort()[0] === x.name ? -1 : 1
}
mainnet.sort(sort)
rinkeby.sort(sort)

const renderGroup = (params: RenderGroupParams) => [
    <ListSubheader key={params.key} component="div">
        {params.key}
    </ListSubheader>,
    params.children,
]

export function ERC20WellKnownTokenSelector(props: {
    onItem: (next: ERC20TokenPredefinedData[0] | null) => void
    useRinkebyNetwork: [boolean, (x: boolean) => void]
    isCustom?: boolean
}) {
    const listItemClasses = useListItemStyles()
    const autoCompleteClasses = useAutoCompleteStyles()
    const [selected, setSelected] = useState<ERC20TokenPredefinedData[0] | null>(null)
    const [useRinkeby, setRinkeby] = props.useRinkebyNetwork
    const { onItem, isCustom } = props

    const [address, setTokenAddress] = useState('')
    const [decimals, setDecimal] = useState(0)
    const [tokenName, setTokenName] = useState('')
    const [symbol, setSymbol] = useState('')
    const isInvalidAddr = !Wallet.EthereumAddress.isValid(address)
    const isValidInput = !(!isCustom
        ? selected === null
        : isInvalidAddr || tokenName.length === 0 || symbol.length === 0)

    useEffect(() => {
        if (isValidInput) onItem(isCustom ? { address, decimals, name: tokenName, symbol } : selected)
        else onItem(null)
    }, [isCustom, isValidInput, onItem, selected, address, decimals, tokenName, symbol])

    const onChange = useCallback(
        (e) => {
            setRinkeby(!useRinkeby)
            setSelected(null)
        },
        [useRinkeby],
    )

    return (
        <Box textAlign="left">
            <List disablePadding>
                <ListItem classes={{ root: listItemClasses.root }} onClick={onChange}>
                    <ListItemText primary="Use Rinkeby Network"></ListItemText>
                    <ListItemSecondaryAction classes={{ root: listItemClasses.listItemSecondaryAction }}>
                        <Switch onClick={onChange} checked={useRinkeby} color="primary" edge="end" />
                    </ListItemSecondaryAction>
                </ListItem>
            </List>
            {!isCustom ? (
                // TODO!: the selected item is wrong
                <>
                    <Autocomplete
                        disableListWrap
                        classes={autoCompleteClasses}
                        ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
                        renderGroup={renderGroup}
                        options={useRinkeby ? rinkeby : mainnet}
                        getOptionLabel={(option: typeof mainnet[0]) => option.name + ` (${option.symbol})`}
                        groupBy={(option: typeof mainnet[0]) => getNameOfToken(option)[0].toUpperCase()}
                        renderInput={(params) => (
                            <TextField {...params} variant="outlined" label="Predefined ERC20 Tokens" fullWidth />
                        )}
                        renderOption={(option: typeof mainnet[0]) => (
                            <Typography key={option.address} noWrap>
                                {getNameOfToken(option)}
                            </Typography>
                        )}
                        value={selected}
                        onChange={(event: any, newValue: typeof mainnet[0] | null) => {
                            setSelected(newValue || null)
                        }}
                    />
                    {selected?.address ? (
                        <Typography component="p" style={{ marginTop: 8 }} variant="caption">
                            Address: {selected?.address}
                        </Typography>
                    ) : null}
                    {selected?.decimals ? (
                        <Typography component="p" variant="caption">
                            Decimals: {selected?.decimals}
                        </Typography>
                    ) : null}
                </>
            ) : (
                <>
                    <TextField
                        required
                        error={isInvalidAddr && !!address.length}
                        label="Contract Address"
                        value={address}
                        onChange={(e) => setTokenAddress(e.target.value)}></TextField>
                    <TextField
                        required
                        label="Decimal"
                        value={decimals}
                        type="number"
                        inputProps={{ min: 0 }}
                        onChange={(e) => setDecimal(parseInt(e.target.value))}></TextField>
                    <TextField
                        required
                        label="Name"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}></TextField>
                    <TextField
                        required
                        label="Symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}></TextField>{' '}
                </>
            )}
        </Box>
    )
}
function getNameOfToken(x: typeof mainnet[0]) {
    return (x.name + ` (${x.symbol})`).replace(/^ +/g, '')
}
