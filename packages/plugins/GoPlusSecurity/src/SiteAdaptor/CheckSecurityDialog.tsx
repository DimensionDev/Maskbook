import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { InjectedDialog } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useFungibleToken, useFungibleTokenPrice } from '@masknet/web3-hooks-base'
import { CoinGeckoTrending, GoPlusLabs } from '@masknet/web3-providers'
import type { SecurityAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Box, DialogActions, DialogContent, Stack } from '@mui/material'
import { skipToken, useQuery } from '@tanstack/react-query'
import { toNumber } from 'lodash-es'
import { useEffect } from 'react'
import { useAsyncFn } from 'react-use'
import { DefaultPlaceholder } from './components/DefaultPlaceholder.js'
import { Footer } from './components/Footer.js'
import { NotFound } from './components/NotFound.js'
import { SearchBox } from './components/SearchBox.js'
import { SecurityPanel } from './components/SecurityPanel.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        height: 510,
        maxHeight: 510,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    footer: {
        height: 56,
        boxSizing: 'border-box',
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
    const { classes } = useStyles()

    useEffect(() => {
        onSearch(chainId, tokenAddress)
    }, [ChainId, tokenAddress])

    const [{ value, loading: searching, error }, onSearch] = useAsyncFn(
        async (chainId: ChainId, content: string): Promise<SecurityAPI.TokenSecurityType | undefined> => {
            if (!content || isSameAddress(content.trim(), ZERO_ADDRESS)) return
            const values = await GoPlusLabs.getTokenSecurity(chainId, [content.trim()])
            if (!values) throw new Error(t`Contract Not Found`)
            return values
        },
        [],
    )

    const { data: tokenDetailed, isFetching: loadingToken } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        value?.contract,
    )

    const { data: tokenPrice } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, value?.contract, { chainId })
    const contract = value?.contract
    const { data: tokenMarketCap } = useQuery({
        queryKey: ['coingecko', 'market-info', contract, value?.token_symbol],
        queryFn:
            contract && value.token_symbol && !searching ?
                async () => {
                    const marketInfo = await CoinGeckoTrending.getCoinMarketInfo(contract)
                    return marketInfo?.market_cap ? toNumber(marketInfo.market_cap) : null
                }
            :   skipToken,
    })

    return (
        <InjectedDialog title={<Trans>Check Security</Trans>} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Stack minHeight={0} flexGrow={1}>
                    {!searchHidden && (
                        <Box m={2}>
                            <SearchBox onSearch={onSearch} />
                        </Box>
                    )}
                    <Stack flex={1} overflow="auto" p={2}>
                        {searching || loadingToken ?
                            <Stack height="100%" justifyContent="center" alignItems="center">
                                <LoadingBase size={36} />
                            </Stack>
                        : error ?
                            <NotFound />
                        : value ?
                            <SecurityPanel
                                tokenInfo={tokenDetailed}
                                tokenSecurity={value}
                                tokenPrice={tokenPrice}
                                tokenMarketCap={tokenMarketCap ?? undefined}
                            />
                        :   <Stack height="100%" justifyContent="center" alignItems="center">
                                <DefaultPlaceholder />
                            </Stack>
                        }
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions className={classes.footer}>
                <Footer />
            </DialogActions>
        </InjectedDialog>
    )
}
