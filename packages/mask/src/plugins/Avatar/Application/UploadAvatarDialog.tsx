import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import AvatarEditor from 'react-avatar-editor'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { NextIDStorage, Twitter, TwitterBaseAPI } from '@masknet/web3-providers'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { BindingProof, fromHex, ProfileIdentifier, toBase64 } from '@masknet/shared-base'
import type { Persona } from '../../../database'
import type { NextIDAvatarMeta } from '../types'
import { useI18N } from '../locales/i18n_generated'
import { context } from '../context'
import { PluginNFTAvatarRPC } from '../messages'
import { RSS3_KEY_SNS } from '../constants'
import { useSubscription } from 'use-subscription'

const useStyles = makeStyles()((theme) => ({
    actions: {
        padding: theme.spacing(0, 2, 2, 2),
    },
    cancel: {
        backgroundColor: theme.palette.background.default,
        border: 'none',
        '&:hover': {
            border: 'none',
        },
    },
}))

interface UploadAvatarDialogProps {
    account?: string
    isBindAccount?: boolean
    image?: string | File
    token?: ERC721TokenDetailed
    proof?: BindingProof
    onBack: () => void
    onClose: () => void
}

type AvatarInfo = TwitterBaseAPI.AvatarInfo & { avatarId: string }

async function saveToRSS3(info: NextIDAvatarMeta, account: string, identifier: ProfileIdentifier) {
    const avatar = await PluginNFTAvatarRPC.saveNFTAvatar(
        account,
        info,
        identifier.network,
        RSS3_KEY_SNS.TWITTER,
    ).catch((error) => {
        console.log(error)
        return
    })
    return avatar
}

async function saveToNextID(
    info: NextIDAvatarMeta,
    persona?: Pick<Persona, 'identifier' | 'publicHexKey'>,
    proof?: BindingProof,
) {
    if (!proof?.identity || !persona?.publicHexKey || !persona.identifier) return
    const payload = await NextIDStorage.getPayload(persona.publicHexKey, proof?.platform, proof?.identity, info)
    if (!payload.ok) {
        return
    }
    const result = await Services.Identity.generateSignResult(persona.identifier, payload.val.signPayload)
    if (!result) return
    const response = await NextIDStorage.set(
        payload.val.uuid,
        persona.publicHexKey,
        toBase64(fromHex(result.signature.signature)),
        proof.platform,
        proof.identity,
        payload.val.createdAt,
        info,
    )
    return response.ok
}

async function Save(
    account: string,
    isBindAccount: boolean,
    token: ERC721TokenDetailed,
    data: AvatarInfo,
    persona: Pick<Persona, 'identifier' | 'publicHexKey'>,
    proof: BindingProof,
    identifier: ProfileIdentifier,
) {
    if (!data) return false

    const info: NextIDAvatarMeta = {
        nickname: data.nickname,
        userId: data.userId,
        imageUrl: data.imageUrl,
        avatarId: data.avatarId,
        address: token.contractDetailed.address,
        tokenId: token.tokenId,
    }

    if (isBindAccount) {
        return saveToNextID(info, persona, proof)
    }
    return saveToRSS3(info, account, identifier)
}

async function uploadAvatar(blob: Blob, userId: string): Promise<AvatarInfo | undefined> {
    try {
        const media = await Twitter.uploadUserAvatar(userId, blob)
        const data = await Twitter.updateProfileImage(userId, media.media_id_string)
        if (!data) {
            return
        }
        const avatarId = getAvatarId(data?.imageUrl ?? '')
        return { ...data, avatarId }
    } catch (err) {
        return
    }
}
export function UploadAvatarDialog(props: UploadAvatarDialogProps) {
    const { image, account, token, onClose, onBack, proof, isBindAccount = false } = props
    const { classes } = useStyles()
    const identifier = useSubscription(context.currentVisitingProfile)
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)
    const { showSnackbar } = useCustomSnackbar()
    const [disabled, setDisabled] = useState(false)
    const { currentConnectedPersona } = usePersonaConnectStatus()
    const t = useI18N()

    const onSave = useCallback(() => {
        if (!editor || !account || !token || !currentConnectedPersona || !proof || !identifier) return
        editor.getImage().toBlob(async (blob) => {
            if (!blob) return
            setDisabled(true)

            const avatarData = await uploadAvatar(blob, identifier.identifier.userId)
            if (!avatarData) {
                setDisabled(false)
                return
            }

            const response = await Save(
                account,
                isBindAccount,
                token,
                avatarData,
                currentConnectedPersona,
                proof,
                identifier.identifier,
            )

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
    }, [account, editor, identifier, onClose, currentConnectedPersona, proof, isBindAccount])

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
