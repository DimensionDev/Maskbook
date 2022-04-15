import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import AvatarEditor from 'react-avatar-editor'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { NextIDStorage, Twitter } from '@masknet/web3-providers'
import { PluginNFTAvatarRPC } from '../../Avatar/messages'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { RSS3_KEY_SNS } from '../../Avatar/constants'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { useAsyncRetry } from 'react-use'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { v4 as uuid } from 'uuid'
import type { BindingProof, ECKeyIdentifier } from '@masknet/shared-base'
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

async function personaSign(message: string, identifier: ECKeyIdentifier) {
    try {
        const result = await Services.Identity.signWithPersona({
            method: 'eth',
            message: message,
            identifier: identifier.toText(),
        })
        return result
    } catch {
        return
    }
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

            const info = {
                nickname: data?.nickname,
                userId: data?.userId,
                imageUrl: data?.imageUrl,
                avatarId,
                address: token.contractDetailed.address,
                tokenId: token.tokenId,
            }

            const result = await personaSign(JSON.stringify(info), persona.identifier)
            if (!result) return
            await NextIDStorage.set(
                uuid(),
                persona.publicHexKey!,
                result?.signature.signature,
                proof.platform,
                proof.identity,
                new Date().toISOString(),
                info,
            )
            const avatar = await PluginNFTAvatarRPC.saveNFTAvatar(
                account,
                {
                    userId: data?.userId ?? '',
                    address: token.contractDetailed.address,
                    tokenId: token.tokenId,
                    avatarId,
                },
                identity.identifier.network,
                RSS3_KEY_SNS.TWITTER,
            ).catch((error) => {
                showSnackbar(error.message, { variant: 'error' })
                setDisabled(false)
                return
            })
            if (!avatar) {
                showSnackbar('Sorry, failed to save NFT Avatar. Please set again.', { variant: 'error' })
                setDisabled(false)
                return
            }
            showSnackbar('Update NFT Avatar Success!', { variant: 'success' })
            onClose()
            setDisabled(false)
        })
    }, [editor, identity, onClose, persona, proof])

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
