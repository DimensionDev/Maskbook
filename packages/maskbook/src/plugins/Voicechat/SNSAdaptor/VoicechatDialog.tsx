import { Box, Button, Checkbox, DialogContent, DialogProps, FormControlLabel, TextField } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useState } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { VOICECHAT_META_KEY_1 } from '../constants'
import type { VoiceChatMetadata } from '../types'
import { useCompositionContext } from '../../../components/CompositionDialog/CompositionContext'

const useStyles = makeStyles()((theme) => ({
    line: {
        display: 'flex',
        margin: theme.spacing(1),
    },
    whiteColor: {
        color: '#fff',
    },
}))

interface VoicechatDialogProps extends withClasses<'wrapper'> {
    open: boolean
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export const VoicechatDialog = (props: VoicechatDialogProps) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { attachMetadata, dropMetadata } = useCompositionContext()

    const [voicechatEnabled, setVoicechatEnabled] = useState(false)
    const [customServerURL, setCustomServerURL] = useState('')

    const submit = () => {
        const set: VoiceChatMetadata = { customServer: customServerURL }

        if (voicechatEnabled) {
            attachMetadata(VOICECHAT_META_KEY_1, JSON.parse(JSON.stringify(set)))
            props.open && setVoicechatEnabled(true)
        } else {
            dropMetadata(VOICECHAT_META_KEY_1)
            props.open && setVoicechatEnabled(false)
        }
        props.onClose()
    }

    return (
        <InjectedDialog open={props.open} onClose={props.onClose} title={t('plugin_voicechat_title')}>
            <DialogContent>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={voicechatEnabled}
                            onChange={(event) => setVoicechatEnabled(event.target.checked)}
                            name="voicechatEnabled"
                            color="primary"
                        />
                    }
                    label={t('plugin_voicechat_activate_switch')}
                />
                <Box marginTop={1}>
                    <TextField
                        label={t('plugin_voicechat_custom_server_url')}
                        value={customServerURL}
                        onChange={(event) => setCustomServerURL(event.target.value)}
                        fullWidth
                    />
                </Box>
                <div className={classes.line} style={{ justifyContent: 'flex-end' }}>
                    <Button color="primary" variant="contained" style={{ color: '#fff' }} onClick={submit}>
                        {t('plugin_voicechat_save')}
                    </Button>
                </div>
            </DialogContent>
        </InjectedDialog>
    )
}
