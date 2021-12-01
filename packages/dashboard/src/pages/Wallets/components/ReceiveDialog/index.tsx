import { memo } from 'react'
import { useDashboardI18N } from '../../../../locales'
import { MaskColorVar, MaskDialog } from '@masknet/theme'
import { QRCode, useSnackbarCallback } from '@masknet/shared'
import { DialogContent, Typography, DialogActions, Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { WalletQRCodeContainer } from '../../../../components/WalletQRCodeContainer'
import { useCopyToClipboard } from 'react-use'
import { useCurrentSelectedWalletNetwork } from '../../api'
import { formatEthereumEns, NetworkType, resolveNetworkAddressPrefix } from '@masknet/web3-shared-evm'
import { useReverseAddress } from '@masknet/plugin-infra'

const useStyles = makeStyles()((theme) => ({
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
    const currentSelectedWalletNetwork = useCurrentSelectedWalletNetwork()
    const { value: domain } = useReverseAddress(walletAddress)

    return (
        <ReceiveDialogUI
            open={open}
            chainName={chainName}
            walletAddress={walletAddress}
            domain={domain}
            onClose={onClose}
            currentNetworkType={currentSelectedWalletNetwork}
        />
    )
})

export interface ReceiveDialogUIProps extends ReceiveDialogProps {
    currentNetworkType: NetworkType
    domain?: string
}

export const ReceiveDialogUI = memo<ReceiveDialogUIProps>(
    ({ open, currentNetworkType, chainName, onClose, walletAddress, domain }) => {
        const { classes } = useStyles()
        const t = useDashboardI18N()
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
                            text={`${resolveNetworkAddressPrefix(currentNetworkType)}:${walletAddress}`}
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
                        {domain ? formatEthereumEns(domain) : walletAddress}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button size="medium" onClick={() => copyWalletAddress(walletAddress)}>
                        {t.wallets_address_copy()}
                    </Button>
                </DialogActions>
            </MaskDialog>
        )
    },
)
