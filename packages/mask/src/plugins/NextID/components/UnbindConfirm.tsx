import { memo, useState } from 'react'
import { Box, DialogContent, Button } from '@mui/material'
import { useI18N } from '../locales'
import { makeStyles, MaskDialog } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '24px !important',
    },
    wrapper1: {
        width: '320px !important',
    },
    title: {
        fontSize: '16px',
        fontWeight: 500,
        marginBottom: '24px',
    },
    content: {
        marginBottom: '36px',
    },
    confirmButton: {
        width: '100%',
        marginBottom: '16px',
        backgroundColor: 'red',
        color: 'white',
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

    const [isShow, setIsShow] = useState(true)

    const handleConfirm = () => {
        onConfirm()
        setIsShow(false)
    }
    return (
        <MaskDialog open={!!unbindAddress && isShow} maxWidth="xs" title="">
            <DialogContent className={classes.wrapper}>
                <Box className={classes.title}>
                    Delete {unbindAddress.slice(0, 8)}...{unbindAddress.slice(-4)} &#xFF1F;
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
