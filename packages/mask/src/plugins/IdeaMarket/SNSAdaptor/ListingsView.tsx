import { useFetchIdeaTokens } from '../hooks/useFetchIdeaTokens'
import { Box, Button, IconButton, TextField } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { IdeaToken } from '../types'
import { formatterToUSD } from '../utils'
import { formatWeiToEther } from '@masknet/web3-shared-evm'
import { renderInvestButton } from '../SNSAdaptor/InvestButton'
import { escapeRegExp } from 'lodash-unified'
import { useCallback, useEffect, useState } from 'react'
import { SearchIcon } from '@masknet/icons'
import ClearIcon from '@mui/icons-material/Clear'

// QuickSearchToolbar.propTypes = {
//     clearSearch: PropTypes.func.isRequired,
//     onChange: PropTypes.func.isRequired,
//     value: PropTypes.string.isRequired,
// }

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
    const { value, error, loading } = useFetchIdeaTokens()
    const formattedData = useCallback(
        () =>
            value?.ideaTokens.map((token: IdeaToken) => {
                return {
                    id: token.id,
                    name: token.name,
                    price: formatterToUSD.format(token.latestPricePoint.price),
                    deposits: formatterToUSD.format(formatWeiToEther(token.daiInToken).toNumber()),
                    button: <Button />,
                }
            }),
        [value, formatterToUSD],
    )

    const columns = [
        { field: 'name' },
        { field: 'price' },
        { field: 'deposits' },
        { field: 'button', headerName: '', renderCell: renderInvestButton },
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
        <Box sx={{ height: 400 }}>
            <DataGrid
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
        </Box>
    )
}
