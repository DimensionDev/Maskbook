import { DialogActions, DialogContent, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useSharedI18N } from '../../../locales'
import { SecurityPanel } from './components/SecurityPanel'
import { Footer } from './components/Footer'
import { Center, TokenSecurity } from './components/Common'
import { CurrencyType, getCoinGeckoPlatformId, useERC721ContractDetailed } from '@masknet/web3-shared-evm'
import { Searching } from './components/Searching'
import { useAsync } from 'react-use'
import { TokenPrice } from '@masknet/web3-providers'
import { InjectedDialog } from '../../../contexts'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: 600,
    },
    paperRoot: {
        backgroundImage: 'none',
        width: 584,
        '&>h2': {
            borderBottom: theme.palette.mode === 'light' ? undefined : `1px solid ${theme.palette.divider}`,
            background:
                theme.palette.mode === 'light'
                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                    : undefined,
            display: 'grid !important',
            gridTemplateColumns: 'repeat(3, 1fr)',
        },
    },
    content: {
        height: 510,
        maxHeight: 510,
        padding: 16,
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
    tokenSecurity: TokenSecurity
}

export function CheckSecurityDialog(props: BuyTokenDialogProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()
    const { open, onClose, tokenSecurity } = props

    const { value: contractDetailed, loading: loadingToken } = useERC721ContractDetailed(tokenSecurity?.contract)
    const { value: tokenPrice } = useAsync(async () => {
        const platformId = getCoinGeckoPlatformId(tokenSecurity.chainId)
        return TokenPrice.getTokenPrices(platformId, [tokenSecurity.contract], CurrencyType.USD)
    }, [tokenSecurity])
    return (
        <InjectedDialog classes={{ paper: classes.paperRoot }} title={t.check_security()} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Stack height="100%" spacing={2}>
                    <Stack flex={1}>
                        {loadingToken && (
                            <Center>
                                <Searching />
                            </Center>
                        )}
                        {!loadingToken && (
                            <SecurityPanel
                                tokenInfo={contractDetailed}
                                tokenPrice={tokenPrice?.[tokenSecurity?.contract]}
                                tokenSecurity={tokenSecurity}
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
