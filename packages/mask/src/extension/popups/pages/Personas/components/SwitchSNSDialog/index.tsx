import { memo } from 'react'
import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../../../utils'

const useStyles = makeStyles()(() => ({
    title: {
        fontSize: 16,
        lineHeight: '22px',
        color: '#0F1419',
    },
    content: {
        marginTop: 24,
        fontSize: 14,
        lineHeight: '20px',
        color: '#536471',
    },
    button: {
        padding: '8px 0',
        width: '100%',
        borderRadius: 9999,
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '20px',
        backgroundColor: '#1C68F3',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#1a5edd',
        },
    },
}))

export const SwitchSNSDialog = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    return (
        <Dialog open>
            <DialogContent>
                <Typography className={classes.title}>Switch Twitter Account</Typography>
                <Typography className={classes.content}>
                    You are not connected to @Vitalik.eth, please log in and try again.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button className={classes.button}>Confirm</Button>
            </DialogActions>
        </Dialog>
    )
})
