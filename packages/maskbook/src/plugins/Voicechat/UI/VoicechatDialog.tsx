import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import {
    DialogContent,
    DialogProps,
    FormControlLabel,
    Checkbox,
    Button,
    makeStyles,
    createStyles,
    TextField,
    Box,
} from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useState, useEffect } from 'react'
import type { VoiceChatMetadata } from '../types'
import { VOICECHAT_META_KEY_1 } from '../constants'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { globalTypedMessageMetadata, editActivatedPostMetadata } from '../../../protocols/typed-message/global-state'

const useNewStyles = makeStyles((theme) =>
    createStyles({
        line: {
            display: 'flex',
            margin: theme.spacing(1),
        },
        whiteColor: {
            color: '#fff',
        },
    }),
)

interface VoicechatDialogProps extends withClasses<'wrapper'> {
    open: boolean
    onConfirm: (meta: VoiceChatMetadata) => void
    onDecline: () => void
    DialogProps?: Partial<DialogProps>
}

export const VoicechatDialog = (props: VoicechatDialogProps) => {
    const classes = useStylesExtends(useNewStyles(), props)

    const { t } = useI18N()

    const [voicechatEnabled, setVoicechatEnabled] = useState(false)
    const [customServerURL, setCustomServerURL] = useState('')

    const submit = () => {
        const set: VoiceChatMetadata = { customServer: customServerURL }

        editActivatedPostMetadata((next) => {
            if (voicechatEnabled) {
                next.set(VOICECHAT_META_KEY_1, JSON.parse(JSON.stringify(set)))
            } else {
                next.delete(VOICECHAT_META_KEY_1)
            }
        })
        props.onConfirm(set)
    }

    const currentMeta = useValueRef(globalTypedMessageMetadata)
    useEffect(() => {
        if (props.open) {
            const enabled = Array.from(currentMeta.keys()).includes(VOICECHAT_META_KEY_1)
            setVoicechatEnabled(enabled)
        }
    }, [props.open])

    return (
        <InjectedDialog
            open={props.open}
            onClose={props.onDecline}
            title={t('plugin_voicechat_title')}
            DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={voicechatEnabled}
                            onChange={(e) => setVoicechatEnabled(e.target.checked)}
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
                        onChange={(e) => setCustomServerURL(e.target.value)}
                        fullWidth={true}
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
