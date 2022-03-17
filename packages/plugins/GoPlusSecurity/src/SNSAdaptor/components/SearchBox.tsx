import { Box, Button, InputAdornment, MenuItem, Stack, Typography } from '@mui/material'
import { useAsync } from 'react-use'
import { useMenuConfig } from '@masknet/shared'
import { memo, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { makeStyles, MaskTextField } from '@masknet/theme'
import { SearchIcon } from '@masknet/icons'
import { useI18N } from '../../locales'
import { GoPlusLabs } from '@masknet/web3-providers'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '600px',
    },
    content: {
        width: '552px',
    },
    menu: {},
}))

interface SearchBoxProps {
    onSearch(chainId: number, content: string): void
}

export const SearchBox = memo<SearchBoxProps>(({ onSearch }) => {
    const t = useI18N()
    const { classes } = useStyles()
    const [selectedNetwork, setSelectedNetwork] = useState<number>(1)
    const [searchContent, setSearchSearchContent] = useState<string>()

    const { value: supportedChains = [] } = useAsync(GoPlusLabs.getSupportedChain, [])

    const [menu, openMenu] = useMenuConfig(
        supportedChains.map((chain) => {
            return (
                <MenuItem key={chain.id} onClick={() => setSelectedNetwork(chain.id)}>
                    <Typography sx={{ marginLeft: 1 }}>{chain.name}</Typography>
                </MenuItem>
            )
        }) ?? [],
        {
            classes: { paper: classes.menu },
        },
    )
    return (
        <Stack direction="row">
            <Box>
                <Button onClick={openMenu} variant="outlined" size="small">
                    {selectedNetwork}
                    <KeyboardArrowDownIcon />
                </Button>
            </Box>
            <Box>
                <MaskTextField
                    placeholder="Search"
                    autoFocus
                    fullWidth
                    onChange={(e) => setSearchSearchContent(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    disabled={!!searchContent}
                    onClick={() => onSearch(selectedNetwork, searchContent ?? '')}
                    variant="outlined"
                    size="small">
                    {t.search()}
                </Button>
            </Box>
        </Stack>
    )
})
