import { Box, Button, InputAdornment, MenuItem, Stack, Typography } from '@mui/material'
import { useAsync } from 'react-use'
import { memo, useMemo, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { makeStyles, MaskColorVar, MaskTextField, ShadowRootMenu } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../locales'
import type { SecurityAPI } from '@masknet/web3-providers'
import { GoPlusLabs } from '@masknet/web3-providers'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'
import { useNetworkDescriptors } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

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
        color: theme.palette.text.primary,
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
    onSearch(chainId: ChainId, content: string): void
}

const DEFAULT_SEARCH_CHAIN = ChainId.Mainnet

function getChainName(chain?: SecurityAPI.SupportedChain<ChainId>) {
    if (!chain) return chainResolver.chainName(ChainId.Mainnet)
    return chainResolver.chainName(chain.chainId) ?? chain.name
}

const unIntegrationChainLogos: Record<number, URL> = {
    128: new URL('../../assets/chain-heco.png', import.meta.url),
    66: new URL('../../assets/chain-okex.png', import.meta.url),
    25: new URL('../../assets/chain-cronos.png', import.meta.url),
}

export const SearchBox = memo<SearchBoxProps>(({ onSearch }) => {
    const t = useI18N()
    const { classes } = useStyles()
    const [selectedChain, setSelectedChain] = useState<SecurityAPI.SupportedChain<ChainId>>()
    const [searchContent, setSearchSearchContent] = useState<string>()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const onClose = () => setAnchorEl(null)
    const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
    const networks = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)
    const { value: supportedChains = [] } = useAsync(async () => {
        const chains = await GoPlusLabs.getSupportedChain()
        return chains.map((x) => {
            const network = networks.find((n) => n.chainId === x.chainId)
            const icon: URL | undefined = unIntegrationChainLogos[x.chainId]
            return { ...x, icon, ...network }
        })
    }, [networks])

    const menuElements = useMemo(() => {
        if (!supportedChains.length) return
        setSelectedChain(supportedChains[0])
        return (
            supportedChains
                .filter((x) => x.icon)
                .map((chain) => {
                    return (
                        <MenuItem
                            key={chain.chainId}
                            onClick={() => {
                                setSelectedChain(chain)
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
            <Box width={140} height={48}>
                <Button onClick={onOpen} variant="outlined" className={classes.selectedButton}>
                    <Stack display="inline-flex" direction="row" justifyContent="space-between" width="100%">
                        <Typography fontSize={16}>{getChainName(selectedChain)}</Typography>
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
