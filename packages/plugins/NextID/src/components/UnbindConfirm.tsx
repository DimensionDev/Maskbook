import { memo, useState } from 'react'
import { Box, DialogContent, Button } from '@mui/material'
import { makeStyles, MaskDialog } from '@masknet/theme'
import { Others } from '@masknet/web3-providers'
import { useNextID_I18N } from '../locales/index.js'

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
    const t = useNextID_I18N()
    const { classes } = useStyles()

    const [isVisible, setVisible] = useState(true)

    const handleConfirm = () => {
        onConfirm()
        setVisible(false)
    }
    return (
        <MaskDialog open={!!unbindAddress && isVisible} maxWidth="xs" title="">
            <DialogContent className={classes.wrapper}>
                <Box className={classes.title}>
                    {t.delete()} {Others.formatAddress(unbindAddress, 4)} &#xFF1F;
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
