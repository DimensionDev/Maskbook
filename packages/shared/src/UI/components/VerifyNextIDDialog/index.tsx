import { Icons } from '@masknet/icons'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { publishPost } from '@masknet/plugin-infra/content-script/context'
import {
    formatPersonaFingerprint,
    resolveNetworkToNextIDPlatform,
    type NextIDPayload,
    type PersonaInformation,
} from '@masknet/shared-base'
import { ActionButton, MaskColorVar, makeStyles } from '@masknet/theme'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Box, Link, Skeleton, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { useVerifyContent } from '../../../hooks/index.js'
import { useBaseUIRuntime } from '../../contexts/index.js'
import { BindingDialog, type BindingDialogProps } from '../BindingDialog/index.js'
import { EmojiAvatar } from '../EmojiAvatar/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    dialog: {
        inset: 0,
        margin: 'auto',
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
    },
    main: {
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    avatar: {
        display: 'block',
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: `solid 1px ${MaskColorVar.border}`,
        '&.connected': {
            borderColor: MaskColorVar.success,
        },
    },
    button: {
        minWidth: 150,
        height: 40,
        minHeight: 40,
        marginLeft: 0,
        marginTop: 0,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
        fontSize: 14,
        wordBreak: 'keep-all',
        '&,&:hover': {
            color: `${MaskColorVar.twitterButtonText} !important`,
            background: `${MaskColorVar.twitterButton} !important`,
        },
    },
    tip: {
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '16px',
        color: theme.palette.maskColor.second,
        marginTop: theme.spacing(2),
    },
    connection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(1.5),
        gap: theme.spacing(1.5),
        color: theme.palette.maskColor.main,
    },
    connectItem: {
        flex: 1,
        width: 148,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    postContentTitle: {
        fontSize: 12,
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
    postContent: {
        color: theme.palette.maskColor.main,
        fontSize: 12,
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 12,
        padding: theme.spacing(1),
        marginTop: theme.spacing(1.5),
        whiteSpace: 'pre-line',
        wordBreak: 'break-all',
    },
    text: {
        fontSize: 12,
        fontWeight: 400,
        color: theme.palette.maskColor.second,
    },
    info: {
        overflow: 'auto',
    },
    name: {
        display: 'block',
        fontSize: 14,
        fontWeight: 500,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    second: {
        color: theme.palette.maskColor.second,
        fontSize: 12,
        display: 'block',
        alignItems: 'center',
        marginTop: theme.spacing(0.5),
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    linkIcon: {
        fontSize: 0,
        color: theme.palette.maskColor.second,
        marginLeft: 2,
    },
    send: {
        marginRight: theme.spacing(1),
    },
    footer: {
        borderRadius: 12,
        backdropFilter: 'blur(8px)',
        boxShadow: theme.palette.maskColor.bottomBg,
        padding: theme.spacing(2),
        marginTop: 'auto',
    },
}))

export type VerifyNextIDDialogCloseProps = {
    aborted?: boolean
    postId?: string | null
    signature?: string
    payload?: NextIDPayload
}

export interface VerifyNextIDDialogProps extends BindingDialogProps {
    personaInfo: PersonaInformation
    onSentPost?(result?: VerifyNextIDDialogCloseProps | undefined): void
}

export function VerifyNextIDDialog({ onSentPost, onClose, personaInfo }: VerifyNextIDDialogProps) {
    const { classes, cx } = useStyles()
    const queryClient = useQueryClient()

    const myIdentity = useLastRecognizedIdentity()
    const userId = myIdentity?.identifier?.userId || 'you'
    const username = myIdentity?.nickname
    const avatar = myIdentity?.avatar
    const personaName = personaInfo?.nickname
    const personaIdentifier = personaInfo?.identifier

    const { data: content, isPending: creatingVerifyContent, refetch } = useVerifyContent(personaIdentifier, userId)

    const { networkIdentifier } = useBaseUIRuntime()
    const platform = resolveNetworkToNextIDPlatform(networkIdentifier)

    const disableVerify = useMemo(() => {
        return !myIdentity?.identifier || !userId ? false : myIdentity.identifier.userId !== userId
    }, [myIdentity, userId])

    const [{ loading: verifying, value: verifiedSuccess }, onVerify] = useAsyncFn(async () => {
        const post = content?.post
        if (!personaInfo || !platform || !post) return

        const postId = await publishPost?.([post], {
            reason: 'verify',
        })
        // Need to create a new post, since Twitter will not allow to post duplicate ones.
        refetch()
        Telemetry.captureEvent(EventType.Access, EventID.EntryPopupSocialAccountVerifyTwitter)
        await queryClient.invalidateQueries({
            queryKey: ['@@next-id', 'bindings-by-persona', personaInfo.identifier.publicKeyAsHex],
        })

        onSentPost?.({
            postId,
            signature: content.signature,
            payload: content.payload,
        })
    }, [personaInfo, content, queryClient, platform, onSentPost])

    if (!personaIdentifier) return null

    const disabled = !userId || !personaName || disableVerify

    return (
        <BindingDialog onClose={onClose} className={classes.dialog}>
            <div className={classes.body}>
                <Box p={2} overflow="auto" className={classes.main}>
                    <Box className={classes.connection}>
                        <Box className={classes.connectItem}>
                            <Box width={36}>
                                <img src={avatar} className={cx(classes.avatar, 'connected')} />
                            </Box>
                            <Box className={classes.info}>
                                <Typography className={classes.name}>{username}</Typography>
                                <Typography className={classes.second}>@{userId}</Typography>
                            </Box>
                        </Box>
                        <Icons.Connect size={24} />
                        <Box className={classes.connectItem}>
                            <EmojiAvatar value={personaIdentifier.publicKeyAsHex} />
                            <Box className={classes.info}>
                                <Typography className={classes.name}>{personaName}</Typography>
                                <Typography className={classes.second} component="div">
                                    {formatPersonaFingerprint(personaIdentifier.rawPublicKey, 4)}
                                    <Link
                                        className={classes.linkIcon}
                                        href={`https://web3.bio/${personaIdentifier.publicKeyAsHex}`}
                                        target="_blank">
                                        <Icons.LinkOut size={12} />
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    {!platform || verifiedSuccess ?
                        <Typography className={classes.text}>
                            {platform ?
                                <Trans>
                                    Verification post sent.
                                    <br />
                                    <br />
                                    You could check the verification result on Mask Pop-up after few minutes. If it
                                    failed, please try again later.
                                </Trans>
                            :   <Trans>
                                    Connected successfully.
                                    <br />
                                    <br />
                                    Trying exploring more features powered by Mask Network.
                                </Trans>
                            }
                        </Typography>
                    : creatingVerifyContent ?
                        <>
                            <Typography className={classes.postContentTitle}>
                                <Trans>Post content:</Trans>
                            </Typography>
                            <Typography className={classes.postContent}>
                                <Skeleton variant="text" />
                                <Skeleton variant="text" />
                                <Skeleton variant="text" />
                                <Skeleton variant="text" width="50%" />
                                <Skeleton variant="text" />
                                <Skeleton variant="text" width="50%" />
                            </Typography>
                            <Typography className={classes.tip} component="div">
                                <Trans>
                                    We will need to verify your Twitter account and record it on the NextID. Please post
                                    it for validation.
                                </Trans>
                            </Typography>
                        </>
                    : content?.post ?
                        <>
                            <Typography className={classes.postContentTitle}>
                                <Trans>Post content:</Trans>
                            </Typography>
                            <Typography className={classes.postContent}>{content.post}</Typography>
                            <Typography className={classes.tip} component="div">
                                <Trans>
                                    We will need to verify your Twitter account and record it on the NextID. Please post
                                    it for validation.
                                </Trans>
                            </Typography>
                        </>
                    :   null}
                </Box>

                <Box className={classes.footer}>
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        disabled={disabled}
                        loading={verifying}
                        onClick={onVerify}>
                        <Icons.Send size={18} className={classes.send} />
                        <Trans>Send</Trans>
                    </ActionButton>
                </Box>
            </div>
        </BindingDialog>
    )
}
