import { memo, useState } from 'react'
import { Box, Button, InputAdornment, MenuItem, Stack, Typography } from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { makeStyles, MaskTextField } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { EVMChainResolver } from '@masknet/web3-providers'
import type { SecurityAPI } from '@masknet/web3-providers/types'
import { ChainId } from '@masknet/web3-shared-evm'
import { WalletIcon, useMenuConfig } from '@masknet/shared'
import { useSupportedChains } from '../hooks/useSupportedChains.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    option: {},
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
    search: {
        background: theme.palette.maskColor.input,
        height: 40,
        borderRadius: 8,
    },
    menu: {
        background: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 4px 30px rgba(255, 255, 255, 0.15)'
            :   '0px 4px 30px rgba(0, 0, 0, 0.1)',
    },
}))

interface SearchBoxProps {
    onSearch(chainId: ChainId, content: string): void
}

const DEFAULT_SEARCH_CHAIN = ChainId.Mainnet

function getChainName(chain?: SecurityAPI.SupportedChain<ChainId>) {
    if (!chain) return EVMChainResolver.chainName(ChainId.Mainnet)
    return EVMChainResolver.chainName(chain.chainId) ?? chain.name
}

export const SearchBox = memo<SearchBoxProps>(({ onSearch }) => {
    const { _ } = useLingui()
    const { classes } = useStyles()
    const [selectedChain, setSelectedChain] = useState<
        SecurityAPI.SupportedChain<ChainId> & {
            icon?: string
        }
    >()
    const [searchContent, setSearchSearchContent] = useState<string>()
    const { value: supportedChains = [] } = useSupportedChains()
    const [menu, openMenu] = useMenuConfig(
        supportedChains
            .filter((x) => x.icon)
            .map((chain) => {
                return (
                    <MenuItem
                        key={chain.chainId}
                        onClick={() => {
                            setSelectedChain(chain)
                        }}>
                        <Stack
                            display="inline-flex"
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            gap={1}
                            width="100%">
                            <WalletIcon mainIcon={chain.icon} size={18} />
                            <Typography>{getChainName(chain)}</Typography>
                        </Stack>
                    </MenuItem>
                )
            }) ?? [],
        { classes: { paper: classes.menu } },
    )

    return (
        <Stack direction="row" spacing={1}>
            <Box width={140} height={40}>
                <Button onClick={openMenu} variant="outlined" className={classes.selectedButton}>
                    <Stack
                        className={classes.option}
                        display="inline-flex"
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%">
                        <Stack gap={0.5} display="inline-flex" direction="row" alignItems="center">
                            <WalletIcon mainIcon={selectedChain?.icon ?? supportedChains[0]?.icon} size={18} />
                            <Typography fontSize={14}>{getChainName(selectedChain ?? supportedChains[0])}</Typography>
                        </Stack>
                        <KeyboardArrowDownIcon />
                    </Stack>
                </Button>
            </Box>
            <Stack direction="row" flex={1} spacing={1}>
                <Box flex={1}>
                    <MaskTextField
                        placeholder={_(msg`Please enter token contract address.`)}
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
                    <Trans>Search</Trans>
                </Button>
            </Stack>

            {menu}
        </Stack>
    )
})
