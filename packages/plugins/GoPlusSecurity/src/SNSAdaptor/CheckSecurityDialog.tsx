import { Box, DialogActions, DialogContent, Stack } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../locales'
import { SearchBox } from './components/SearchBox'
import { useAsync, useAsyncFn } from 'react-use'
import { GoPlusLabs, TokenView } from '@masknet/web3-providers'
import { Searching } from './components/Searching'
import { SecurityPanel } from './components/SecurityPanel'
import { Footer } from './components/Footer'
import { Center, TokenSecurity } from './components/Common'
import { DefaultPlaceholder } from './components/DefaultPlaceholder'
import { NotFound } from './components/NotFound'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { InjectedDialog } from '@masknet/shared'
import { first, isEmpty } from 'lodash-unified'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { useFungibleToken, useFungibleTokenPrice } from '@masknet/plugin-infra/web3'
import { useState } from 'react'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: 600,
    },
    paperRoot: {},
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

export interface BuyTokenDialogProps extends withClasses<never | 'root'> {
    open: boolean
    onClose(): void
}

export function CheckSecurityDialog(props: BuyTokenDialogProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { open, onClose } = props
    const [chainId, setChainId] = useState<ChainId>()

    const [{ value, loading: searching, error }, onSearch] = useAsyncFn(
        async (chainId: ChainId, content: string): Promise<TokenSecurity | undefined> => {
            if (!content || isSameAddress(content.trim(), ZERO_ADDRESS)) return
            setChainId(chainId)
            let values = await GoPlusLabs.getTokenSecurity(chainId, [content.trim()])
            values ??= {}
            if (isEmpty(values)) throw new Error(t.contract_not_found())
            const entity = first(Object.entries(values ?? {}))
            if (!entity) return
            return { ...entity[1], contract: entity[0], chainId }
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
        return TokenView.getTokenInfo(value.token_symbol)
    }, [value])

    return (
        <InjectedDialog title={t.__plugin_name()} classes={{ paper: classes.paperRoot }} open={open} onClose={onClose}>
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
