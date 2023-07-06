import { memo, useCallback, useState } from 'react'
import { Dialog, DialogContent, DialogActions, Typography, Button } from '@mui/material'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { ActionButton, makeStyles } from '@masknet/theme'
import { StyledInput } from '../../components/StyledInput/index.js'

interface RestWalletDialogProps {
    open: boolean
    onClose: () => void
}

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        textAlign: 'center',
    },
    dialogContent: {
        width: 320,
    },
    content: {
        marginTop: 24,
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    actions: {
        display: 'flex',
        padding: '0 24px',
        marginBottom: 16,
        alignItems: 'center',
        alignSelf: 'stretch',
        gap: 6,
    },
    button: {
        flex: '1 0 0',
    },
}))

export const ResetWalletDialog = memo<RestWalletDialogProps>(function ResetWalletDialog({ open, onClose }) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [answer, setAnswer] = useState('')
    const onConfirm = useCallback(async () => {
        await browser.tabs.create({
            active: true,
            url: browser.runtime.getURL('/dashboard.html#/create-mask-wallet/form'),
        })
    }, [])

    const disabled = answer !== 'RESET'
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent className={classes.dialogContent}>
                <Typography className={classes.title}>{t('popups_wallet_reset_wallet')}</Typography>
                <Typography className={classes.content}>{t('popups_wallet_reset_wallet_description')}</Typography>
                <StyledInput
                    type="text"
                    value={answer}
                    onChange={(ev) => {
                        setAnswer(ev.currentTarget.value)
                    }}
                />
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button onClick={onClose} variant="roundedOutlined" className={classes.button}>
                    {t('cancel')}
                </Button>
                <ActionButton
                    variant="roundedContained"
                    color="error"
                    onClick={onConfirm}
                    className={classes.button}
                    disabled={disabled}>
                    {t('confirm')}
                </ActionButton>
            </DialogActions>
        </Dialog>
    )
})
