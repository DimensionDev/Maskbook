import { DialogActions, DialogContent, Stack } from '@mui/material'
import { makeStyles, MaskDialog } from '@masknet/theme'
import { useSharedI18N } from '../../../locales'
import { SecurityPanel } from './components/SecurityPanel'
import { Footer } from './components/Footer'
import { Center, TokenSecurity } from './components/Common'
import { useERC721ContractDetailed } from '@masknet/web3-shared-evm'
import { Searching } from './components/Searching'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: 600,
    },
    paperRoot: {
        backgroundImage: 'none',
        '&>h2': {
            border: `1px solid ${theme.palette.divider}`,
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
    tokenSecurity: TokenSecurity
}

export function CheckSecurityDialog(props: BuyTokenDialogProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()
    const { open, onClose, tokenSecurity } = props

    const { value: contractDetailed, loading: loadingToken } = useERC721ContractDetailed(tokenSecurity?.contract)

    return (
        <MaskDialog
            DialogProps={{ classes: { paper: classes.paperRoot } }}
            title={t.check_security()}
            open={open}
            onBack={onClose}>
            <DialogContent className={classes.content}>
                <Stack height="100%" spacing={2}>
                    <Stack flex={1}>
                        {loadingToken && (
                            <Center>
                                <Searching />
                            </Center>
                        )}
                        {!loadingToken && <SecurityPanel tokenInfo={contractDetailed} tokenSecurity={tokenSecurity} />}
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions className={classes.footer}>
                <Footer />
            </DialogActions>
        </MaskDialog>
    )
}
