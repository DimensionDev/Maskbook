import { Box, DialogActions, DialogContent, Stack } from '@mui/material'
import { makeStyles, MaskDialog, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../locales'
import { SearchBox } from './components/SearchBox'
import { useAsync, useAsyncFn } from 'react-use'
import { GoPlusLabs, TokenPrice } from '@masknet/web3-providers'
import { Searching } from './components/Searching'
import { SecurityPanel } from './components/SecurityPanel'
import { Footer } from './components/Footer'
import { Center, TokenSecurity } from './components/Common'
import { DefaultPlaceholder } from './components/DefaultPlaceholder'
import { NotFound } from './components/NotFound'
import { ChainId, CurrencyType, getCoinGeckoPlatformId, useERC721ContractDetailed } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: 600,
    },
    paperRoot: {
        backgroundImage: 'none',
        '&>h2': {
            height: 30,
            border: `1px solid ${theme.palette.divider}`,
            padding: theme.spacing(1.875, 2.5, 1.875, 2.5),
            marginBottom: 24,
        },
    },
    content: {
        width: 552,
        height: 510,
        maxHeight: 510,
        paddingBottom: theme.spacing(3),
    },
    footer: {
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12)',
        padding: '8px',
        justifyContent: 'flex-end',
    },
}))

export interface BuyTokenDialogProps extends withClasses<never | 'root'> {
    open: boolean
    onClose(): void
}

export function CheckSecurityDialog(props: BuyTokenDialogProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { open, onClose } = props

    const [{ value, loading: searching, error }, onSearch] = useAsyncFn(async (chainId: ChainId, content: string) => {
        const values = await GoPlusLabs.getTokenSecurity(chainId, [content.trim()])
        if (!Object.keys(values ?? {}).length) throw new Error('Contract Not Found')
        return Object.entries(values ?? {}).map((x) => ({ ...x[1], contract: x[0], chainId }))[0] as
            | TokenSecurity
            | undefined
    }, [])
    const { value: contractDetailed, loading: loadingToken } = useERC721ContractDetailed(value?.contract)
    const { value: tokenPrice } = useAsync(async () => {
        if (!value) return
        const platformId = getCoinGeckoPlatformId(value.chainId)
        return TokenPrice.getTokenPrices(platformId, [value.contract], CurrencyType.USD)
    }, [value])
    return (
        <MaskDialog
            DialogProps={{ classes: { paper: classes.paperRoot } }}
            title={t.__plugin_name()}
            open={open}
            onBack={onClose}>
            <DialogContent className={classes.content}>
                <Stack height="100%" spacing={2}>
                    <Box>
                        <SearchBox onSearch={onSearch} />
                    </Box>
                    <Stack flex={1}>
                        {(searching || loadingToken) && (
                            <Center>
                                <Searching />
                            </Center>
                        )}
                        {error && !searching && !loadingToken && <NotFound />}
                        {!error && !searching && !loadingToken && value && (
                            <SecurityPanel
                                tokenInfo={contractDetailed}
                                tokenSecurity={value}
                                tokenPrice={tokenPrice?.[value?.contract]}
                            />
                        )}
                        {!error && !searching && !loadingToken && !value && (
                            <Center>
                                <DefaultPlaceholder />
                            </Center>
                        )}
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions className={classes.footer}>
                <Footer />
            </DialogActions>
        </MaskDialog>
    )
}
