import React from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete, { RenderGroupParams } from '@material-ui/lab/Autocomplete'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import ListSubheader from '@material-ui/core/ListSubheader'
import { useTheme, makeStyles } from '@material-ui/core/styles'
import { VariableSizeList, ListChildComponentProps } from 'react-window'
import { Typography, FormControlLabel, Switch } from '@material-ui/core'
import type { ERC20TokenPredefinedData } from '../../../erc20'

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

const useStyles = makeStyles({
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
    selectedItem: [ERC20TokenPredefinedData[0] | undefined, (next: ERC20TokenPredefinedData[0] | undefined) => void]
    useRinkebyNetwork: [boolean, (x: boolean) => void]
}) {
    const classes = useStyles()
    const [selected, setSelected] = props.selectedItem
    const [useRinkeby, setRinkeby] = props.useRinkebyNetwork

    return (
        <>
            <FormControlLabel
                control={
                    <Switch
                        checked={useRinkeby}
                        onChange={(e) => {
                            setRinkeby(e.currentTarget.checked)
                            setSelected(undefined)
                        }}
                        color="primary"
                    />
                }
                label="Use Rinkeby Network"
            />
            <Autocomplete
                disableListWrap
                classes={classes}
                ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
                renderGroup={renderGroup}
                options={useRinkeby ? rinkeby : mainnet}
                getOptionLabel={(option: typeof mainnet[0]) => option.name + ` (${option.symbol})`}
                groupBy={(option: typeof mainnet[0]) => getNameOfToken(option)[0].toUpperCase()}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Predefined ERC20 Tokens" fullWidth />
                )}
                renderOption={(option: typeof mainnet[0]) => <Typography noWrap>{getNameOfToken(option)}</Typography>}
                value={selected}
                onChange={(event: any, newValue: typeof mainnet[0] | null) => {
                    setSelected(newValue || undefined)
                }}
            />
            <Typography style={{ marginTop: 24 }} variant="caption">
                Address: {selected?.address}
            </Typography>
            <br />
            <Typography variant="caption">Decimals: {selected?.decimals}</Typography>
        </>
    )
}
function getNameOfToken(x: typeof mainnet[0]) {
    return (x.name + ` (${x.symbol})`).replace(/^ +/g, '')
}
