import { DialogActions, DialogContent, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useSharedI18N } from '../../../locales'
import { SecurityPanel } from './components/SecurityPanel'
import { Footer } from './components/Footer'
import { Center, TokenSecurity } from './components/Common'
import { Searching } from './components/Searching'
import { useAsync } from 'react-use'
import { TokenView } from '@masknet/web3-providers'
import { InjectedDialog } from '../../../contexts'
import { useFungibleToken, useFungibleTokenPrice } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    title: {
        width: 600,
    },
    content: {
        margin: 0,
        padding: '0px !important',
        '::-webkit-scrollbar': {
            display: 'none',
        },
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

export interface BuyTokenDialogProps {
    open: boolean
    onClose(): void
    tokenSecurity: TokenSecurity
}

export function CheckSecurityDialog(props: BuyTokenDialogProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()
    const { open, onClose, tokenSecurity } = props

    const { value: tokenDetailed, loading: loadingToken } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        tokenSecurity?.contract,
    )
    const { value: tokenPrice } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, tokenSecurity?.contract)

    const { value: tokenMarketCapInfo } = useAsync(async () => {
        if (!tokenSecurity?.token_symbol) return
        return TokenView.getTokenInfo(tokenSecurity.token_symbol)
    }, [tokenSecurity])

    return (
        <InjectedDialog title={t.check_security()} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Stack height="100%" padding="16px">
                    <Stack flex={1}>
                        {loadingToken && (
                            <Center>
                                <Searching />
                            </Center>
                        )}
                        {!loadingToken && (
                            <SecurityPanel
                                tokenInfo={tokenDetailed}
                                tokenPrice={tokenPrice}
                                tokenSecurity={tokenSecurity}
                                tokenMarketCap={tokenMarketCapInfo}
                            />
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
