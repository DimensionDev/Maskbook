import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import AvatarEditor from 'react-avatar-editor'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { NextIDStorage, Twitter, TwitterBaseAPI } from '@masknet/web3-providers'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import { BindingProof, fromHex, PersonaIdentifier, ProfileIdentifier, toBase64 } from '@masknet/shared-base'
import type { NextIDAvatarMeta } from '../types'
import { useI18N } from '../locales/i18n_generated'
import { context } from '../context'
import { PLUGIN_ID, RSS3_KEY_SNS } from '../constants'
import { useSubscription } from 'use-subscription'
import Services from '../../../extension/service'
import { useSaveNFTAvatar } from '../hooks'
import { useAsyncFn } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    actions: {
        padding: theme.spacing(0, 2, 2, 2),
    },
    cancel: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#111418',
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
    token?: NonFungibleToken<ChainId, SchemaType>
    proof?: BindingProof
    onBack: () => void
    onClose: () => void
}

type AvatarInfo = TwitterBaseAPI.AvatarInfo & { avatarId: string }

function useSaveToRSS3() {
    const [, saveNFTAvatar] = useSaveNFTAvatar()

    return useAsyncFn(
        async (info: NextIDAvatarMeta, account: string, identifier: ProfileIdentifier) => {
            return saveNFTAvatar(account, info, identifier.network, RSS3_KEY_SNS.TWITTER)
        },
        [saveNFTAvatar],
    )
}

function useSaveToNextID() {
    return useAsyncFn(async (info: NextIDAvatarMeta, persona?: PersonaIdentifier, proof?: BindingProof) => {
        if (!proof?.identity || !persona?.publicKeyAsHex) return
        const payload = await NextIDStorage.getPayload(
            persona.publicKeyAsHex,
            proof?.platform,
            proof?.identity,
            info,
            PLUGIN_ID,
        )
        if (!payload.ok) {
            return
        }
        const result = await Services.Identity.generateSignResult(persona, payload.val.signPayload)
        if (!result) return
        const response = await NextIDStorage.set(
            payload.val.uuid,
            persona.publicKeyAsHex,
            toBase64(fromHex(result.signature.signature)),
            proof.platform,
            proof.identity,
            payload.val.createdAt,
            info,
            PLUGIN_ID,
        )
        return response.ok
    })
}

function useSave() {
    const [, saveToNextID] = useSaveToNextID()
    const [, saveToRSS3] = useSaveToRSS3()

    return useAsyncFn(
        async (
            account: string,
            isBindAccount: boolean,
            token: NonFungibleToken<ChainId, SchemaType>,
            data: AvatarInfo,
            persona: PersonaIdentifier,
            proof: BindingProof,
            identifier: ProfileIdentifier,
        ) => {
            if (!data || !token.contract?.address) return false

            const info: NextIDAvatarMeta = {
                nickname: data.nickname,
                userId: data.userId,
                imageUrl: data.imageUrl,
                avatarId: data.avatarId,
                address: token.contract?.address,
                tokenId: token.tokenId,
                chainId: token.contract?.chainId ?? ChainId.Mainnet,
                schema: token.contract?.schema ?? SchemaType.ERC20,
            }

            if (isBindAccount) {
                return saveToNextID(info, persona, proof)
            }
            return saveToRSS3(info, account, identifier)
        },
        [saveToNextID, saveToRSS3],
    )
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
    const [, saveAvatar] = useSave()

    const onSave = useCallback(() => {
        if (!editor) return
        editor.getImage().toBlob(async (blob) => {
            if (!blob || !account || !token || !currentConnectedPersona?.linkedProfiles[0].identifier || !proof) return
            setDisabled(true)

            const avatarData = await uploadAvatar(blob, currentConnectedPersona?.linkedProfiles[0].identifier.userId)
            if (!avatarData) {
                setDisabled(false)
                return
            }

            const response = await saveAvatar(
                account,
                isBindAccount,
                token,
                avatarData,
                currentConnectedPersona.identifier,
                proof,
                currentConnectedPersona.linkedProfiles[0].identifier,
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
    }, [account, editor, identifier, onClose, currentConnectedPersona, proof, isBindAccount, saveAvatar])

    if (!account || !image || !token || !proof) return null

    return (
        <>
            <DialogContent sx={{ overFlow: 'hidden' }}>
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
