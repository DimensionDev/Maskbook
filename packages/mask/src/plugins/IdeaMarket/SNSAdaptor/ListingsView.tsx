import { useState } from 'react'
import { useFetchIdeaTokensBySearch } from '../hooks/useFetchIdeaTokens'
import { makeStyles } from '@masknet/theme'
import { Box, Grid, IconButton, Link, Stack, TextField } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid'
import type { IdeaToken } from '../types'
import { composeIdeaURL, formatterToUSD, truncate } from '../utils'
import { formatWeiToEther } from '@masknet/web3-shared-evm'
import { SearchIcon } from '@masknet/icons'
import ClearIcon from '@mui/icons-material/Clear'
import { LoadingAnimation } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import { BuyButton } from './BuyButton'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            height: 350,
            width: '100%',
        },
        grid: {
            '& .MuiDataGrid-row:nth-child(odd)': {
                backgroundColor: theme.palette.background.default,
                '&:hover': {
                    backgroundColor: theme.palette.background.default,
                },
            },
            '& .MuiDataGrid-row:nth-child(even)': {
                '&:hover': {
                    backgroundColor: 'inherit',
                },
            },
        },
        market: {
            color: 'rgba(8,87,224,1)',
            marginLeft: theme.spacing(0.25),
        },
        empty: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: theme.spacing(8, 0),
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
    const { classes } = useStyles()
    const { t } = useI18N()
    const [searchText, setSearchText] = useState('')
    const { tokens, loading } = useFetchIdeaTokensBySearch(searchText)

    const formattedData = tokens?.map((token: IdeaToken) => {
        return {
            id: token.id,
            name: token.name,
            dayChange: token.dayChange,
            market: token.market.name,
            price: token.latestPricePoint.price,
            deposits: formatWeiToEther(token.daiInToken).toNumber(),
            button: '',
        }
    })

    const renderNameCell = (params: GridRenderCellParams<String>) => (
        <Grid container direction="column">
            <div title={params.row.name}>{truncate(params.row.name, 25)}</div>
            <div className={classes.market}>{params.row.market}</div>
        </Grid>
    )

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', headerAlign: 'left' as const, flex: 1, renderCell: renderNameCell },
        {
            field: 'dayChange',
            headerName: '24H',
            type: 'number',
            width: 75,
            headerAlign: 'right' as const,
            valueFormatter: (params: GridValueFormatterParams) => {
                const value = Number(params.value) * 100
                const operator = value >= 0 ? '+' : ''
                return `${operator}${value.toFixed()}%`
            },
        },
        {
            field: 'price',
            headerName: 'Price',
            type: 'number',
            width: 70,
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
            width: 90,
            align: 'right' as const,
            renderCell: (params: GridRenderCellParams) => (
                <Grid container alignContent="center" justifyContent="center">
                    <Grid container item justifyContent="center">
                        <Link href={composeIdeaURL(params.row.market, params.row.name)} target="_blank">
                            View
                        </Link>
                    </Grid>
                    <Grid item>
                        <BuyButton params={params} />
                    </Grid>
                </Grid>
            ),
        },
    ]

    function CustomLoading() {
        return (
            <div className={classes.empty}>
                <LoadingAnimation />
            </div>
        )
    }

    function NoRowsCustomOverlay() {
        return (
            <Stack height="100%" alignItems="center" justifyContent="center">
                {t('no_data')}
            </Stack>
        )
    }

    function NoResultsCustomOverlay() {
        return (
            <Stack height="100%" alignItems="center" justifyContent="center">
                {t('no_data')}
            </Stack>
        )
    }

    return (
        <div className={classes.root}>
            <DataGrid
                className={classes.grid}
                rowsPerPageOptions={[]}
                headerHeight={18}
                components={{
                    Toolbar: QuickSearchToolbar,
                    LoadingOverlay: CustomLoading,
                    NoResultsOverlay: NoResultsCustomOverlay,
                    NoRowsOverlay: NoRowsCustomOverlay,
                }}
                rowHeight={60}
                rows={formattedData ?? []}
                loading={loading}
                columns={columns}
                componentsProps={{
                    toolbar: {
                        value: searchText,
                        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setSearchText(event.target.value),
                        clearSearch: () => setSearchText(''),
                    },
                }}
                disableSelectionOnClick
                disableColumnMenu
            />
        </div>
    )
}
