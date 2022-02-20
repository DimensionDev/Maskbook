import { useCallback, useEffect, useState } from 'react'
import { useFetchIdeaTokens } from '../hooks/useFetchIdeaTokens'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Grid, IconButton, TextField } from '@mui/material'
import { DataGrid, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid'
import type { IdeaToken } from '../types'
import { displaySocialName, formatterToUSD } from '../utils'
import { formatWeiToEther } from '@masknet/web3-shared-evm'
import { escapeRegExp } from 'lodash-unified'
import { SearchIcon } from '@masknet/icons'
import ClearIcon from '@mui/icons-material/Clear'
import { InvestButton } from '../SNSAdaptor/InvestButton'

const useStyles = makeStyles()((theme) => {
    return {
        subname: {
            color: 'rgba(8,87,224,1)',
        },
    }
})

interface QuickSearchToolbarProps {
    clearSearch: () => void
    onChange: () => void
    value: string
}

function QuickSearchToolbar(props: QuickSearchToolbarProps) {
    return (
        <Box
            sx={{
                p: 0.5,
                pb: 0,
            }}>
            <TextField
                variant="standard"
                value={props.value}
                onChange={props.onChange}
                placeholder="Search&#x2026;"
                InputProps={{
                    startAdornment: <SearchIcon fontSize="small" />,
                    endAdornment: (
                        <IconButton
                            title="Clear"
                            aria-label="Clear"
                            size="small"
                            style={{ visibility: props.value ? 'visible' : 'hidden' }}
                            onClick={props.clearSearch}>
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    ),
                }}
                sx={{
                    width: {
                        xs: 1,
                        sm: 'auto',
                    },
                    m: (theme) => theme.spacing(1, 0.5, 1.5),
                    '& .MuiSvgIcon-root': {
                        mr: 0.5,
                    },
                    '& .MuiInput-underline:before': {
                        borderBottom: 1,
                        borderColor: 'divider',
                    },
                }}
            />
        </Box>
    )
}

export function ListingsView() {
    const [searchText, setSearchText] = useState('')
    const [rows, setRows] = useState([])
    const { classes } = useStyles()
    const { value, error, loading } = useFetchIdeaTokens()
    const formattedData = useCallback(
        () =>
            value?.ideaTokens.map((token: IdeaToken) => {
                return {
                    id: token.id,
                    name: token.name,
                    price: token.latestPricePoint.price,
                    deposits: formatWeiToEther(token.daiInToken).toNumber(),
                    button: <Button />,
                }
            }),
        [value, formatterToUSD],
    )

    const renderNameCell = (params: GridRenderCellParams<String>) => (
        <Grid container direction="column">
            <div>{params.row.name}</div>
            <div className={classes.subname}>{displaySocialName(params.row.name)}</div>
        </Grid>
    )

    // const renderSearchHeader = (params: GridColumnHeaderParams) => <QuickSearchToolbar />

    const columns = [
        { field: 'name', headerName: 'Name', headerAlign: 'left' as const, flex: 1, renderCell: renderNameCell },
        {
            field: 'price',
            headerName: 'Price',
            type: 'number',
            headerAlign: 'center' as const,
            align: 'center' as const,
            valueFormatter: (params: GridValueFormatterParams) => formatterToUSD.format(params.value as number),
        },
        {
            field: 'deposits',
            headerName: 'Deposits',
            headerAlign: 'center' as const,
            type: 'number',
            align: 'center' as const,
            valueFormatter: (params: GridValueFormatterParams) => formatterToUSD.format(params.value as number),
        },
        {
            field: 'button',
            headerName: '',
            sortable: false,
            width: 130,
            align: 'right' as const,
            renderCell: (params: GridRenderCellParams) => <InvestButton params={params} />,
        },
    ]

    const requestSearch = (searchValue: any) => {
        setSearchText(searchValue)
        const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')
        const filteredRows = formattedData().filter((row: any) => {
            return Object.keys(row).some((field) => {
                return searchRegex.test(row[field].toString())
            })
        })
        setRows(filteredRows)
    }

    useEffect(() => {
        setRows(formattedData() ?? [])
    }, [formattedData])

    return (
        <div style={{ height: 350, width: '100%' }}>
            <DataGrid
                disableSelectionOnClick
                disableColumnMenu
                headerHeight={18}
                components={{ Toolbar: QuickSearchToolbar }}
                rows={rows}
                columns={columns}
                componentsProps={{
                    toolbar: {
                        value: searchText,
                        onChange: (event: React.ChangeEvent<HTMLInputElement>) => requestSearch(event.target.value),
                        clearSearch: () => requestSearch(''),
                    },
                }}
            />
        </div>
    )
}
