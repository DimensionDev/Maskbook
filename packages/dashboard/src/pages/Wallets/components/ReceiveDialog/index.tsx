import { memo } from 'react'
import { useDashboardI18N } from '../../../../locales'
import { MaskColorVar, MaskDialog, QRCode } from '@dimensiondev/maskbook-theme'
import { DialogContent, Typography, makeStyles, DialogActions, Button } from '@material-ui/core'
import { WalletQRCodeContainer } from '../../../../components/WalletQRCodeContainer'
import { useCopyToClipboard } from 'react-use'
import { useSnackbarCallback } from '../../../../hooks/useSnackbarCallback'

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
    tokenName: string
    tokenAddress: string
    onClose: () => void
}

export const ReceiveDialog = memo<ReceiveDialogProps>(({ open, tokenName, tokenAddress, onClose }) => {
    const classes = useStyles()
    const t = useDashboardI18N()

    const [, copyToClipboard] = useCopyToClipboard()
    const copyWalletAddress = useSnackbarCallback(async (address: string) => copyToClipboard(address), [])

    return (
        <MaskDialog
            open={open}
            title={t.wallets_balance_Receive()}
            onClose={onClose}
            DialogProps={{
                classes: { paper: classes.paper },
            }}>
            <DialogContent className={classes.container}>
                <Typography sx={{ marginBottom: 3.5 }}>{t.wallets_receive_tips({ tokenName })}</Typography>
                <WalletQRCodeContainer width={286} height={286} borderWidth={15} borderHeight={2}>
                    <QRCode
                        text={`ethereum:${tokenAddress}`}
                        canvasProps={{
                            style: { display: 'block', margin: 'auto', width: '100%', height: '100%' },
                        }}
                    />
                </WalletQRCodeContainer>
                <Typography variant="body2" className={classes.addressTitle}>
                    {t.wallets_address()}
                </Typography>
                <Typography variant="body2" className={classes.address}>
                    {tokenAddress}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button size="medium" onClick={() => copyWalletAddress(tokenAddress)}>
                    copy
                </Button>
            </DialogActions>
        </MaskDialog>
    )
})
