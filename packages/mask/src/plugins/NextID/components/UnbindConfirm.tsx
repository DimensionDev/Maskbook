import { memo, useState } from 'react'
import { Box, DialogContent, Button } from '@mui/material'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { useI18N } from '../locales'
import { makeStyles, MaskDialog } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '24px !important',
    },
    title: {
        fontSize: '16px',
        fontWeight: 500,
        marginBottom: '24px',
    },
    content: {
        marginBottom: '36px',
        color: theme.palette.grey[700],
    },
    confirmButton: {
        width: '100%',
        marginBottom: '16px',
        backgroundColor: 'red',
        color: theme.palette.common.white,
    },
    cancelButton: {
        width: '100%',
        marginBottom: '16px',
    },
}))

interface UnbindConfirmProps {
    unbindAddress: string
    onClose(): void
    onConfirm(): void
}

export enum DialogTabs {
    persona = 0,
    wallet = 1,
}

export const UnbindConfirm = memo<UnbindConfirmProps>(({ onClose, unbindAddress, onConfirm }) => {
    const t = useI18N()
    const { classes } = useStyles()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const [isVisible, setVisible] = useState(true)

    const handleConfirm = () => {
        onConfirm()
        setVisible(false)
    }
    return (
        <MaskDialog open={!!unbindAddress && isVisible} maxWidth="xs" title="">
            <DialogContent className={classes.wrapper}>
                <Box className={classes.title}>
                    {t.delete()} {Others?.formatAddress?.(unbindAddress, 4)} &#xFF1F;
                </Box>
                <Box className={classes.content}>{t.disconnect_warning()}</Box>
                <Button className={classes.confirmButton} onClick={handleConfirm}>
                    {t.confirm()}
                </Button>
                <Button className={classes.cancelButton} onClick={onClose}>
                    {t.cancel()}
                </Button>
            </DialogContent>
        </MaskDialog>
    )
})
