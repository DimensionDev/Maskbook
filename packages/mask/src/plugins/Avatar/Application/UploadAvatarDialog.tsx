import { Button, DialogActions, DialogContent, Slider, useTheme } from '@mui/material'
import AvatarEditor from 'react-avatar-editor'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { NextIDStorage, Twitter, TwitterBaseAPI } from '@masknet/web3-providers'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { BindingProof, ECKeyIdentifier, fromHex, toBase64 } from '@masknet/shared-base'
import type { Persona } from '../../../database'
import type { NextIDAvatarMeta } from '../types'
import { useI18N } from '../locales/i18n_generated'
import { context } from '../context'

const useStyles = makeStyles()((theme) => ({
    actions: {
        padding: theme.spacing(0, 2, 2, 2),
    },
    cancel: {
        backgroundColor: theme.palette.background.default,
        border: 'none',
    },
}))

interface UploadAvatarDialogProps {
    account?: string
    image?: string | File
    token?: ERC721TokenDetailed
    proof?: BindingProof
    onBack: () => void
    onClose: () => void
}

async function personaSign(message: string, identifier: ECKeyIdentifier) {
    try {
        return Services.Identity.signWithPersona({
            message,
            method: 'eth',
            identifier: identifier.toText(),
        })
    } catch {
        return
    }
}

async function Save(
    account: string,
    token: ERC721TokenDetailed,
    avatarId: string,
    data: TwitterBaseAPI.AvatarInfo,
    persona: Persona,
    proof: BindingProof,
) {
    if (!data || !proof || !persona?.publicHexKey) return false

    const info: NextIDAvatarMeta = {
        nickname: data?.nickname,
        userId: data?.userId,
        imageUrl: data?.imageUrl,
        avatarId,
        address: token.contractDetailed.address,
        tokenId: token.tokenId,
    }

    const response = await NextIDStorage.getPayload(persona.publicHexKey, proof?.platform, proof?.identity, info)
    if (!response.ok) {
        return false
    }

    const sign = await personaSign(response.val.signPayload, persona.identifier)
    if (!sign) return false

    const setResponse = await NextIDStorage.set(
        response.val.uuid,
        persona.publicHexKey,
        toBase64(fromHex(sign.signature.signature)),
        proof.platform,
        proof.identity,
        response.val.createdAt,
        info,
    )
    return setResponse.ok
}

export function UploadAvatarDialog(props: UploadAvatarDialogProps) {
    const { image, account, token, onClose, onBack, proof } = props
    const { classes } = useStyles()
    const identifier = context.currentVisitingProfile.getCurrentValue()?.identifier
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)
    const { showSnackbar } = useCustomSnackbar()
    const [disabled, setDisabled] = useState(false)
    const { currentConnectedPersona } = usePersonaConnectStatus()
    const t = useI18N()
    const theme = useTheme()

    const onSave = useCallback(() => {
        if (!editor || !account || !token || !currentConnectedPersona || !proof || !identifier) return
        editor.getImage().toBlob(async (blob) => {
            if (!blob) return
            setDisabled(true)

            const media = await Twitter.uploadUserAvatar(identifier.userId, blob)
            const data = await Twitter.updateProfileImage(identifier.userId, media.media_id_string)
            if (!data) {
                setDisabled(false)
                return
            }
            const avatarId = getAvatarId(data?.imageUrl ?? '')

            const response = await Save(account, token, avatarId, data, currentConnectedPersona, proof)
            if (!response) {
                showSnackbar(t.upload_avatar_failed_message(), { variant: 'error' })
                setDisabled(false)
                return
            }
            showSnackbar(t.upload_avatar_success_message(), { variant: 'success' })
            location.reload()
            onClose()
            setDisabled(false)
        })
    }, [account, editor, identifier, onClose, currentConnectedPersona, proof])

    if (!account || !image || !token || !proof) return null

    return (
        <>
            <DialogContent>
                <AvatarEditor
                    ref={(e) => setEditor(e)}
                    image={image!}
                    border={50}
                    style={{ width: '100%', height: '100%' }}
                    scale={scale ?? 1}
                    rotate={0}
                    borderRadius={300}
                />
                <Slider
                    max={2}
                    min={0.5}
                    step={0.1}
                    defaultValue={1}
                    onChange={(_, value) => setScale(value as number)}
                    aria-label="Scale"
                />
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button className={classes.cancel} fullWidth variant="outlined" onClick={onBack}>
                    {t.cancel()}
                </Button>
                <Button disabled={disabled} fullWidth variant="contained" onClick={onSave}>
                    {t.save()}
                </Button>
            </DialogActions>
        </>
    )
}
