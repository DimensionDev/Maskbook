import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import AvatarEditor from 'react-avatar-editor'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { NextIDStorage, Twitter, TwitterBaseAPI } from '@masknet/web3-providers'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { useAsyncRetry } from 'react-use'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { BindingProof, ECKeyIdentifier, fromHex, toBase64 } from '@masknet/shared-base'
import type { Persona } from '../../../database'
import type { NextIDAvatarMeta } from '../types'

const useStyles = makeStyles()((theme) => ({
    actions: {
        padding: theme.spacing(0, 2, 2, 2),
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

async function personaSign(account: string, message: string, identifier: ECKeyIdentifier) {
    try {
        const result1 = Services.Ethereum.personalSign(message, account)
        return result1
    } catch {
        return
    }
}

async function Save(
    account: string,
    token: ERC721TokenDetailed,
    avatarId: string,
    data?: TwitterBaseAPI.AvatarInfo,
    persona?: Persona,
    proof?: BindingProof,
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
    const sign = await personaSign(account, JSON.stringify(info), persona.identifier)
    if (!sign) return false

    const response = await NextIDStorage.getPayload(persona?.publicHexKey, proof?.platform, proof?.identity, info)
    console.log(response)
    if (!response.ok) {
        return false
    }
    const setResponse = await NextIDStorage.set(
        response.val.uuid,
        persona.publicHexKey,
        toBase64(fromHex(sign)),
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
    const identity = useCurrentVisitingIdentity()
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)
    const { showSnackbar } = useCustomSnackbar()
    const [disabled, setDisabled] = useState(false)
    const personaConnectStatus = usePersonaConnectStatus()

    const { value: persona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!identity) return
        return Services.Identity.queryPersonaByProfile(identity.identifier)
    }, [identity, personaConnectStatus.hasPersona])

    const onSave = useCallback(() => {
        if (!editor || !account || !token || !persona || !proof) return
        editor.getImage().toBlob(async (blob) => {
            if (!blob) return
            setDisabled(true)

            const data = await Twitter.uploadUserAvatar(identity.identifier.userId, blob)
            const avatarId = getAvatarId(data?.imageUrl ?? '')

            const response = await Save(account, token, avatarId, data, persona, proof)
            if (!response) {
                showSnackbar('Sorry, failed to save NFT Avatar. Please set again.', { variant: 'error' })
                setDisabled(false)
                return
            }
            showSnackbar('Update NFT Avatar Success!', { variant: 'success' })
            onClose()
            setDisabled(false)
        })
    }, [account, editor, identity, onClose, persona, proof])

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
                <Button sx={{ flex: 1 }} variant="text" onClick={onBack}>
                    Cancel
                </Button>
                <Button disabled={disabled} sx={{ flex: 1 }} variant="contained" onClick={onSave}>
                    Save
                </Button>
            </DialogActions>
        </>
    )
}
