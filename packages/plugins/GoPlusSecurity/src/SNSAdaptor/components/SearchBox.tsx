import { Box, Button, InputAdornment, MenuItem, Stack, Typography } from '@mui/material'
import { memo, useMemo, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { makeStyles, MaskTextField, ShadowRootMenu } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../locales'
import type { SecurityAPI } from '@masknet/web3-providers'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'
import { WalletIcon } from '@masknet/shared'
import { useSupportedChains } from '../hooks/useSupportedChains'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '600px',
    },
    content: {
        width: '552px',
    },
    option: {
        background: theme.palette.maskColor.input,
    },
    selectedButton: {
        padding: theme.spacing(1.5),
        width: '100%',
        height: '100%',
        fontWeight: 400,
        borderColor: theme.palette.divider,
        color: theme.palette.text.primary,
        background: theme.palette.maskColor.input,

        '&:hover': {
            background: theme.palette.maskColor.input,
        },
    },
    searchButton: {
        borderRadius: 8,
    },
    menu: {},
    search: {
        background: theme.palette.maskColor.input,
        height: 40,
        borderRadius: 8,
    },
}))

interface SearchBoxProps {
    onSearch(chainId: ChainId, content: string): void
}

const DEFAULT_SEARCH_CHAIN = ChainId.Mainnet

function getChainName(chain?: SecurityAPI.SupportedChain<ChainId>) {
    if (!chain) return chainResolver.chainName(ChainId.Mainnet)
    return chainResolver.chainName(chain.chainId) ?? chain.name
}

export const SearchBox = memo<SearchBoxProps>(({ onSearch }) => {
    const t = useI18N()
    const { classes } = useStyles()
    const [selectedChain, setSelectedChain] = useState<SecurityAPI.SupportedChain<ChainId> & { icon?: URL }>()
    const [searchContent, setSearchSearchContent] = useState<string>()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const onClose = () => setAnchorEl(null)
    const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)

    const { value: supportedChains = [] } = useSupportedChains()

    const menuElements = useMemo(() => {
        if (!supportedChains.length) return
        setSelectedChain(supportedChains[0])
        return (
            supportedChains.map((chain) => {
                return (
                    <MenuItem
                        key={chain.chainId}
                        onClick={() => {
                            setSelectedChain(chain)
                            onClose()
                        }}>
                        <Stack
                            display="inline-flex"
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            gap={1}
                            width="100%">
                            <WalletIcon mainIcon={chain?.icon} size={18} />
                            <Typography sx={{ fontSize: 14 }}>{getChainName(chain)}</Typography>
                        </Stack>
                    </MenuItem>
                )
            }) ?? []
        )
    }, [supportedChains.length])

    return (
        <Stack direction="row" spacing={1}>
            <Box width={120} height={40}>
                <Button onClick={onOpen} variant="outlined" className={classes.selectedButton}>
                    <Stack
                        className={classes.option}
                        display="inline-flex"
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%">
                        <Stack gap={0.5} display="inline-flex" direction="row" alignItems="center">
                            <WalletIcon mainIcon={selectedChain?.icon} size={18} />
                            <Typography fontSize={14}>{getChainName(selectedChain)}</Typography>
                        </Stack>
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
                        onKeyPress={(event) => {
                            if (event.key !== 'Enter') return
                            onSearch(selectedChain?.chainId ?? DEFAULT_SEARCH_CHAIN, searchContent ?? '')
                        }}
                        onChange={(e) => setSearchSearchContent(e.target.value)}
                        InputProps={{
                            classes: { root: classes.search },
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Icons.Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                <Button
                    className={classes.searchButton}
                    disabled={!searchContent}
                    onClick={() => onSearch(selectedChain?.chainId ?? DEFAULT_SEARCH_CHAIN, searchContent ?? '')}
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
