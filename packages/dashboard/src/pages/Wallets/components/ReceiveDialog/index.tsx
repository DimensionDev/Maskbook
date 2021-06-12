import { memo } from 'react'
import { useDashboardI18N } from '../../../../locales'
import { MaskColorVar, MaskDialog, QRCode } from '@dimensiondev/maskbook-theme'
import { DialogContent, Typography, makeStyles, DialogActions, Button } from '@material-ui/core'
import { WalletQRCodeContainer } from '../../../../components/WalletQRCodeContainer'
import { useCopyToClipboard } from 'react-use'
import { useSnackbarCallback } from '../../../../hooks/useSnackbarCallback'
import { useCurrentSelectedWalletNetwork } from '../../api'
import { resolveNetworkName } from '@dimensiondev/web3-shared'

const useStyles = makeStyles((theme) => ({
    paper: {
        width: '100%',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    addressTitle: {
        marginTop: theme.spacing(1.5),
        color: MaskColorVar.normalText,
    },
    address: {
        marginTop: theme.spacing(1.5),
        fontWeight: 600,
    },
}))

export interface ReceiveDialogProps {
    open: boolean
    chainName: string
    walletAddress: string
    onClose: () => void
}

export const ReceiveDialog = memo<ReceiveDialogProps>(({ open, chainName, walletAddress, onClose }) => {
    const classes = useStyles()
    const t = useDashboardI18N()
    const currentSelectedWalletNetwork = useCurrentSelectedWalletNetwork()
    const [, copyToClipboard] = useCopyToClipboard()
    const copyWalletAddress = useSnackbarCallback({
        executor: async (address: string) => copyToClipboard(address),
        deps: [],
        successText: t.wallets_address_copied(),
    })

    //TODO: The <QRCode /> text prop protocol maybe correct and requires confirmation
    return (
        <MaskDialog
            open={open}
            title={t.wallets_balance_Receive()}
            onClose={onClose}
            DialogProps={{
                classes: { paper: classes.paper },
            }}>
            <DialogContent className={classes.container}>
                <Typography sx={{ marginBottom: 3.5 }}>{t.wallets_receive_tips({ chainName })}</Typography>
                <WalletQRCodeContainer width={286} height={286} border={{ borderWidth: 15, borderHeight: 2 }}>
                    <QRCode
                        text={`${resolveNetworkName(currentSelectedWalletNetwork).toLowerCase()}:${walletAddress}`}
                        options={{ width: 282 }}
                        canvasProps={{
                            style: { display: 'block', margin: 'auto' },
                        }}
                    />
                </WalletQRCodeContainer>
                <Typography variant="body2" className={classes.addressTitle}>
                    {t.wallets_address()}
                </Typography>
                <Typography variant="body2" className={classes.address}>
                    {walletAddress}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button size="medium" onClick={() => copyWalletAddress(walletAddress)}>
                    {t.wallets_address_copy()}
                </Button>
            </DialogActions>
        </MaskDialog>
    )
})
