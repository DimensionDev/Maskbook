import { useEffect } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { toNumber } from 'lodash-es'
import { InjectedDialog } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useFungibleToken, useFungibleTokenPrice } from '@masknet/web3-hooks-base'
import { CoinGeckoTrending, GoPlusLabs } from '@masknet/web3-providers'
import type { SecurityAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, DialogActions, DialogContent, Stack } from '@mui/material'
import { DefaultPlaceholder } from './components/DefaultPlaceholder.js'
import { Footer } from './components/Footer.js'
import { NotFound } from './components/NotFound.js'
import { SearchBox } from './components/SearchBox.js'
import { SecurityPanel } from './components/SecurityPanel.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    content: {
        height: 510,
        maxHeight: 510,
        padding: theme.spacing(2),
    },
    footer: {
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
        padding: '8px',
        justifyContent: 'flex-end',
    },
}))

interface Props {
    open: boolean
    onClose(): void
    searchHidden: boolean
    chainId: ChainId
    tokenAddress: string
}
export function CheckSecurityDialog({ open, onClose, searchHidden, chainId, tokenAddress }: Props) {
    const { _ } = useLingui()
    const { classes } = useStyles()

    useEffect(() => {
        onSearch(chainId, tokenAddress)
    }, [ChainId, tokenAddress])

    const [{ value, loading: searching, error }, onSearch] = useAsyncFn(
        async (chainId: ChainId, content: string): Promise<SecurityAPI.TokenSecurityType | undefined> => {
            if (!content || isSameAddress(content.trim(), ZERO_ADDRESS)) return
            const values = await GoPlusLabs.getTokenSecurity(chainId, [content.trim()])
            if (!values) throw new Error(_(msg`Contract Not Found`))
            return values
        },
        [],
    )

    const { data: tokenDetailed, isPending: loadingToken } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        value?.contract,
    )

    const { data: tokenPrice } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, value?.contract, { chainId })
    const { value: tokenMarketCap } = useAsync(async () => {
        if (!value?.contract || !value.token_symbol) return
        const marketInfo = await CoinGeckoTrending.getCoinMarketInfo(value.contract)
        return marketInfo?.market_cap ? toNumber(marketInfo.market_cap) : undefined
    }, [value?.contract, !value?.token_symbol])

    return (
        <InjectedDialog title={<Trans>Check Security</Trans>} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Stack height="100%" spacing={2}>
                    {!searchHidden && (
                        <Box>
                            <SearchBox onSearch={onSearch} />
                        </Box>
                    )}
                    <Stack flex={1}>
                        {searching || loadingToken ?
                            <Stack height="100%" justifyContent="center" alignItems="center">
                                <LoadingBase size={36} />
                            </Stack>
                        :   null}
                        {error && !searching && !loadingToken ?
                            <NotFound />
                        :   null}
                        {!error && !searching && !loadingToken && value ?
                            <SecurityPanel
                                tokenInfo={tokenDetailed}
                                tokenSecurity={value}
                                tokenPrice={tokenPrice}
                                tokenMarketCap={tokenMarketCap}
                            />
                        :   null}
                        {!error && !searching && !loadingToken && !value && (
                            <Stack height="100%" justifyContent="center" alignItems="center">
                                <DefaultPlaceholder />
                            </Stack>
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
