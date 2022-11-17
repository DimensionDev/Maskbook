import { memo, ReactNode, useEffect, useState } from 'react'
import { Box, DialogActions, DialogContent, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../locales/index.js'
import { SearchBox } from './components/SearchBox.js'
import { useAsync, useAsyncFn } from 'react-use'
import { GoPlusLabs, Nomics, SecurityAPI } from '@masknet/web3-providers'
import { Searching } from './components/Searching.js'
import { SecurityPanel } from './components/SecurityPanel.js'
import { Footer } from './components/Footer.js'
import { DefaultPlaceholder } from './components/DefaultPlaceholder.js'
import { NotFound } from './components/NotFound.js'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { InjectedDialog } from '@masknet/shared'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID, CrossIsolationMessages } from '@masknet/shared-base'
import { useFungibleToken, useFungibleTokenPrice } from '@masknet/web3-hooks-base'

const useStyles = makeStyles()((theme) => ({
    content: {
        height: 510,
        maxHeight: 510,
        padding: theme.spacing(2),
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

export const Center = memo(({ children }: { children: ReactNode }) => (
    <Stack height="100%" justifyContent="center" alignItems="center">
        {children}
    </Stack>
))

export function CheckSecurityDialog() {
    const t = useI18N()
    const { classes } = useStyles()
    const [chainId, setChainId] = useState<ChainId>()
    const [open, setOpen] = useState(false)
    const [searchHidden, setSearchHidden] = useState(false)

    useEffect(() => {
        return CrossIsolationMessages.events.checkSecurityDialogEvent.on((env) => {
            if (!env.open) return
            setOpen(env.open)
            setSearchHidden(env.searchHidden)
            onSearch(env.chainId ?? ChainId.Mainnet, env.tokenAddress ?? ZERO_ADDRESS)
        })
    }, [])

    const [{ value, loading: searching, error }, onSearch] = useAsyncFn(
        async (chainId: ChainId, content: string): Promise<SecurityAPI.TokenSecurityType | undefined> => {
            if (!content || isSameAddress(content.trim(), ZERO_ADDRESS)) return
            setChainId(chainId)
            const values = await GoPlusLabs.getTokenSecurity(chainId, [content.trim()])
            if (!values) throw new Error(t.contract_not_found())
            return values
        },
        [],
    )

    const { value: tokenDetailed, loading: loadingToken } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        value?.contract,
    )
    const { value: tokenPrice } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, value?.contract, { chainId })
    const { value: tokenMarketCapInfo } = useAsync(async () => {
        if (!value?.token_symbol) return
        return Nomics.getCoinMarketInfo(value.token_symbol)
    }, [value])

    const onClose = () => setOpen(false)

    return (
        <InjectedDialog title={t.__plugin_name()} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Stack height="100%" spacing={2}>
                    {!searchHidden && (
                        <Box>
                            <SearchBox onSearch={onSearch} />
                        </Box>
                    )}
                    <Stack flex={1}>
                        {(searching || loadingToken) && (
                            <Center>
                                <Searching />
                            </Center>
                        )}
                        {error && !searching && !loadingToken && <NotFound />}
                        {!error && !searching && !loadingToken && value && (
                            <SecurityPanel
                                tokenInfo={tokenDetailed}
                                tokenSecurity={value}
                                tokenPrice={tokenPrice}
                                tokenMarketCap={tokenMarketCapInfo}
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
        </InjectedDialog>
    )
}
