import { Icons } from '@masknet/icons'
import { ActionButton, makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Dialog, DialogActions, DialogContent, Typography } from '@mui/material'
import { useI18N } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        margin: 0,
        width: 320,
        backgroundColor: theme.palette.maskColor.bottom,
    },
    content: {
        padding: '29px 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        color: theme.palette.maskColor.success,
        marginTop: 30,
        marginBottom: 24,
        fontSize: 20,
        fontWeight: 700,
        lineHeight: '24px',
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
    },
}))

interface CreateSuccessDialogProps {
    open: boolean
    onClose: () => void
    address: string
    owner: string
}

export function CreateSuccessDialog({ open, onClose, address, owner }: CreateSuccessDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()

    return usePortalShadowRoot((container) => (
        <Dialog
            container={container}
            open={open}
            onClose={(_, reason) => {
                if (reason === 'backdropClick') return
                onClose()
            }}
            classes={{ paper: classes.paper }}>
            <DialogContent className={classes.content}>
                <Icons.FillSuccess size={50} />

                <Typography className={classes.title}>{t.create_successfully()}</Typography>
                <Typography className={classes.description}>
                    {t.create_successfully_tips({ address: formatEthereumAddress(address, 4) })}
                </Typography>
                <Typography className={classes.description} sx={{ marginTop: 2 }}>
                    {t.create_successfully_tips_owner({ owner })}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <ActionButton fullWidth variant="roundedContained" onClick={onClose}>
                    {t.done()}
                </ActionButton>
            </DialogActions>
        </Dialog>
    ))
}
