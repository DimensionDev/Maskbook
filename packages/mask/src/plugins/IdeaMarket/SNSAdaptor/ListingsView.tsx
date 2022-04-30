import { useState } from 'react'
import { useFetchIdeaTokensBySearch } from '../hooks/useFetchIdeaTokens'
import { makeStyles } from '@masknet/theme'
import {
    Avatar,
    Box,
    Button,
    Grid,
    IconButton,
    Link,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid'
import { formatterToUSD, urlWithoutProtocol } from '../utils'
import { formatWeiToEther } from '@masknet/web3-shared-evm'
import { SearchIcon } from '@masknet/icons'
import ClearIcon from '@mui/icons-material/Clear'
import { LoadingAnimation } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EMPTY_LIST } from '@masknet/shared-base'
import { UrlIcon } from '../icons/UrlIcon'
import { TwitterIcon } from '../icons/TwitterIcon'
import { BASE_URL, TWITTER_BASE_URL } from '../constants'
import { IdeaToken, Markets } from '../types'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            height: 350,
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
            '& .MuiDataGrid-cell p': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
        },
        box: {
            margin: theme.spacing(1, 1.8),
            paddingBottom: theme.spacing(0),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        market: {
            color: 'rgba(8,87,224,1)',
        },
        empty: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: theme.spacing(8, 0),
        },
        textField: {
            margin: theme.spacing(1, 0.5, 1),
            '& .MuiSvgIcon-root': {
                marginRight: theme.spacing(0.5),
            },
            '& .MuiInput-input': {
                fontSize: 13.125,
            },
            '& .MuiInput-underline:before': {
                borderColor: 'divider',
            },
        },
        avatar: {
            marginRight: theme.spacing(0.8),
            marginLeft: theme.spacing(0.1),
            width: 27,
            height: 27,
        },
        nameCellContainer: {
            width: '100%',
        },
        url: {
            marginRight: theme.spacing(0.7),
            width: 30,
            height: 30,
        },
        toolbarIcon: {
            width: 16,
            marginRight: theme.spacing(0.3),
        },
        toggleButton: {
            textTransform: 'unset',
            padding: theme.spacing(0.7),
        },
        profileAvatar: {
            float: 'left',
            marginTop: theme.spacing(1.1),
        },
    }
})

interface QuickSearchToolbarProps {
    value: string
    clearSearch: () => void
    onChange: () => void
    filters: string[]
    setFilters: (newFilters: string[]) => void
}

function QuickSearchToolbar(props: QuickSearchToolbarProps) {
    const { classes } = useStyles()
    const { t } = useI18N()

    const handleFilters = (event: React.MouseEvent<HTMLElement>, newFilters: string[]) => {
        props.setFilters(newFilters)
    }

    return (
        <Box className={classes.box}>
            <ToggleButtonGroup
                color="primary"
                value={props.filters}
                onChange={handleFilters}
                aria-label="token filter by type">
                <ToggleButton className={classes.toggleButton} size="small" value="0x6" aria-label="url">
                    <UrlIcon className={classes.toolbarIcon} />
                    <Typography variant="body2">{t('plugin_ideamarket_urls')}</Typography>
                </ToggleButton>
                <ToggleButton className={classes.toggleButton} size="small" value="0x1" aria-label="user">
                    <TwitterIcon className={classes.toolbarIcon} />
                    <Typography variant="body2">{t('plugin_ideamarket_users')}</Typography>
                </ToggleButton>
            </ToggleButtonGroup>
            <TextField
                className={classes.textField}
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
            />
        </Box>
    )
}

export function ListingsView() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [searchText, setSearchText] = useState('')
    const [page, setPage] = useState(0)
    const [filters, setFilters] = useState(() => ['0x1', '0x6'])
    const { tokens, loading } = useFetchIdeaTokensBySearch(searchText, page, filters)

    const tokensFormatted = tokens?.map((token: IdeaToken) => {
        return {
            id: token.id,
            name: token.name,
            dayChange: token.dayChange,
            market: token.market.name,
            marketID: token.market.marketID,
            price: token.latestPricePoint.price,
            deposits: formatWeiToEther(token.daiInToken).toNumber(),
            button: '',
            twitter: token?.twitter,
        }
    })

    const renderNameCell = (params: GridRenderCellParams<string>) => {
        return (
            <div className={classes.nameCellContainer}>
                <Grid className={classes.profileAvatar}>
                    {params.row.twitter ? (
                        <Avatar className={classes.avatar} src={params.row.twitter.profile_image_url} />
                    ) : (
                        <UrlIcon className={classes.url} />
                    )}
                </Grid>
                {params.row.marketID === Markets.Twitter ? (
                    <Grid>
                        <Typography title={params.row.twitter ? params.row.twitter.name : params.row.name}>
                            {params.row.twitter?.name} ({params.row.name})
                        </Typography>
                        {params.row.twitter ? (
                            <Typography
                                title={`${TWITTER_BASE_URL}/${params.row.twitter.username}`}
                                className={classes.market}>
                                <Link target="_blank" href={`${TWITTER_BASE_URL}/${params.row.twitter.username}`}>
                                    {TWITTER_BASE_URL}/{params.row.twitter.username}
                                </Link>
                            </Typography>
                        ) : (
                            <Typography title={params.row.name} className={classes.market}>
                                <Link target="_blank" href={`${TWITTER_BASE_URL}/${params.row.name.slice(1)}`}>
                                    {TWITTER_BASE_URL}/{params.row.name.slice(1)}
                                </Link>
                            </Typography>
                        )}
                    </Grid>
                ) : (
                    <Grid item>
                        <Typography title={params.row.name}>{urlWithoutProtocol(params.row.name)}</Typography>

                        <Typography title={params.row.name} className={classes.market}>
                            <Link target="_blank" href={params.row.name}>
                                {params.row.name}
                            </Link>
                        </Typography>
                    </Grid>
                )}
            </div>
        )
    }

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: t('plugin_ideamarket_name'),
            headerAlign: 'left',
            flex: 1,
            renderCell: renderNameCell,
        },
        {
            field: 'dayChange',
            headerName: t('plugin_ideamarket_24h'),
            type: 'number',
            width: 60,
            headerAlign: 'right',
            valueFormatter: (params: GridValueFormatterParams) => {
                const value = Number(params.value) * 100
                const operator = value >= 0 ? '+' : ''
                return `${operator}${value.toFixed()}%`
            },
        },
        {
            field: 'price',
            headerName: t('plugin_ideamarket_price'),
            type: 'number',
            width: 64,
            headerAlign: 'center',
            align: 'center',
            valueFormatter: (params: GridValueFormatterParams) => formatterToUSD.format(params.value as number),
        },
        {
            field: 'deposits',
            headerName: t('plugin_ideamarket_deposits'),
            headerAlign: 'center',
            width: 95,
            type: 'number',
            align: 'center',
            valueFormatter: (params: GridValueFormatterParams) => formatterToUSD.format(params.value as number),
        },
        {
            field: 'button',
            headerName: '',
            sortable: false,
            width: 80,
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Grid container alignContent="center" justifyContent="center">
                    <Grid item>
                        <Button
                            href={`${BASE_URL}/i/${params.row.id}`}
                            target="_blank"
                            color="primary"
                            size="small"
                            variant="contained">
                            {t('plugin_ideamarket_buy')}
                        </Button>
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

    function handlePageChange(newPage: number) {
        setPage(newPage)
    }

    return (
        <div className={classes.root}>
            <DataGrid
                className={classes.grid}
                paginationMode="server"
                rowsPerPageOptions={[20]}
                page={page}
                pageSize={20}
                onPageChange={handlePageChange}
                headerHeight={18}
                components={{
                    Toolbar: QuickSearchToolbar,
                    LoadingOverlay: CustomLoading,
                    NoResultsOverlay: NoResultsCustomOverlay,
                    NoRowsOverlay: NoRowsCustomOverlay,
                }}
                rowHeight={60}
                rows={tokensFormatted ?? EMPTY_LIST}
                rowCount={1000}
                loading={loading}
                columns={columns}
                componentsProps={{
                    toolbar: {
                        value: searchText,
                        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                            setPage(0)
                            setSearchText(event.target.value)
                        },
                        clearSearch: () => setSearchText(''),
                        filters,
                        setFilters,
                        setPage,
                    },
                }}
                disableSelectionOnClick
                disableColumnMenu
            />
        </div>
    )
}
