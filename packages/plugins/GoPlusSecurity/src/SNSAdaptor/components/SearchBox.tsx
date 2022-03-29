import { Box, Button, InputAdornment, MenuItem, Stack, Typography } from '@mui/material'
import { useAsync } from 'react-use'
import { memo, useMemo, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { makeStyles, MaskColorVar, MaskTextField, ShadowRootMenu } from '@masknet/theme'
import { SearchIcon } from '@masknet/icons'
import { useI18N } from '../../locales'
import type { SecurityAPI } from '@masknet/web3-providers'
import { GoPlusLabs } from '@masknet/web3-providers'
import { ChainId, getChainDetailed } from '@masknet/web3-shared-evm'
import parseInt from 'lodash-es/parseInt'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '600px',
    },
    content: {
        width: '552px',
    },
    selectedButton: {
        width: '100%',
        height: '100%',
        fontWeight: 400,
        borderColor: theme.palette.divider,
    },
    searchButton: {
        borderRadius: 8,
    },
    menu: {},
    search: {
        backgroundColor: 'transparent !important',
        border: `solid 1px ${MaskColorVar.twitterBorderLine}`,
        height: 48,
        borderColor: theme.palette.divider,
        borderRadius: 12,
    },
}))

interface SearchBoxProps {
    onSearch(chainId: string, content: string): void
}

const DEFAULT_SEARCH_NETWORK = '1'

function getChainName(chain?: SecurityAPI.SupportedChain) {
    if (!chain) return getChainDetailed(ChainId.Mainnet)?.chain
    if (chain.id === ChainId.BSC.toString()) return getChainDetailed(ChainId.BSC)?.shortName.toUpperCase() ?? chain.name
    return getChainDetailed(parseInt(chain.id))?.chain ?? chain.name
}

export const SearchBox = memo<SearchBoxProps>(({ onSearch }) => {
    const t = useI18N()
    const { classes } = useStyles()
    const [selectedNetwork, setSelectedNetwork] = useState<SecurityAPI.SupportedChain>()
    const [searchContent, setSearchSearchContent] = useState<string>()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const onClose = () => setAnchorEl(null)
    const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)

    const { value: supportedChains = [] } = useAsync(GoPlusLabs.getSupportedChain, [])

    const menuElements = useMemo(() => {
        if (!supportedChains.length) return
        setSelectedNetwork(supportedChains[0])
        return (
            supportedChains.map((chain) => {
                return (
                    <MenuItem
                        key={chain.id}
                        onClick={() => {
                            setSelectedNetwork(chain)
                            onClose()
                        }}>
                        <Typography sx={{ marginLeft: 1 }}>{getChainName(chain)}</Typography>
                    </MenuItem>
                )
            }) ?? []
        )
    }, [supportedChains.length])

    return (
        <Stack direction="row" spacing={1}>
            <Box width={110} height={48}>
                <Button onClick={onOpen} variant="outlined" className={classes.selectedButton}>
                    <Stack display="inline-flex" direction="row" justifyContent="space-between" width="100%">
                        <Typography fontSize={16}>{getChainName(selectedNetwork)}</Typography>
                        <KeyboardArrowDownIcon />
                    </Stack>
                </Button>
            </Box>
            <Stack direction="row" flex={1} spacing={1}>
                <Box flex={1}>
                    <MaskTextField
                        placeholder={t.search_input_placeholder()}
                        autoFocus
                        fullWidth
                        onKeyPress={(e: React.KeyboardEvent) => {
                            if (e.key !== 'Enter') return
                            onSearch(selectedNetwork?.id ?? DEFAULT_SEARCH_NETWORK, searchContent ?? '')
                        }}
                        onChange={(e) => setSearchSearchContent(e.target.value)}
                        InputProps={{
                            classes: { root: classes.search },
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                <Button
                    className={classes.searchButton}
                    disabled={!searchContent}
                    onClick={() => onSearch(selectedNetwork?.id ?? DEFAULT_SEARCH_NETWORK, searchContent ?? '')}
                    variant="contained">
                    {t.search()}
                </Button>
            </Stack>
            <ShadowRootMenu open={!!anchorEl} onClose={onClose} anchorEl={anchorEl}>
                {menuElements}
            </ShadowRootMenu>
        </Stack>
    )
})
