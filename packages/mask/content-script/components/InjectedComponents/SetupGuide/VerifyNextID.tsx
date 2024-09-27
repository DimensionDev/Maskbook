import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import {
    BindingDialog,
    EmojiAvatar,
    type BindingDialogProps,
    useVerifyContent,
    useBaseUIRuntime,
    useVerifyNextID,
} from '@masknet/shared'
import {
    MaskMessages,
    currentSetupGuideStatus,
    formatPersonaFingerprint,
    resolveNetworkToNextIDPlatform,
} from '@masknet/shared-base'
import { ActionButton, MaskColorVar, MaskTextField, makeStyles } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Box, Link, Skeleton, Typography } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import Services from '../../../../shared-ui/service.js'
import { AccountConnectStatus } from './AccountConnectStatus.js'
import { SetupGuideContext } from './SetupGuideContext.js'
import { useConnectPersona } from './hooks/useConnectPersona.js'
import { useNotifyConnected } from './hooks/useNotifyConnected.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
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
    input: {
        width: 136,
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

interface VerifyNextIDProps extends BindingDialogProps {}

export function VerifyNextID({ onClose }: VerifyNextIDProps) {
    const { classes, cx } = useStyles()
    const queryClient = useQueryClient()

    const { userId, myIdentity, personaInfo, checkingVerified, verified, loadingCurrentUserId, currentUserId } =
        SetupGuideContext.useContainer()
    const { nickname: username, avatar } = myIdentity
    const personaName = personaInfo?.nickname
    const personaIdentifier = personaInfo?.identifier

    const [customUserId, setCustomUserId] = useState('')
    const { data: verifyInfo, isPending: creatingPostContent } = useVerifyContent(
        personaIdentifier,
        userId || customUserId,
    )
    const { networkIdentifier } = useBaseUIRuntime()
    const nextIdPlatform = resolveNetworkToNextIDPlatform(networkIdentifier)

    const { data: personaAvatar } = useQuery({
        queryKey: ['@@my-own-persona-info'],
        queryFn: () => Services.Identity.queryOwnedPersonaInformation(false),
        refetchOnMount: true,
        networkMode: 'always',
        select(data) {
            const pubkey = personaInfo?.identifier.publicKeyAsHex
            const info = data.find((x) => x.identifier.publicKeyAsHex === pubkey)
            return info?.avatar
        },
    })

    const disableVerify = useMemo(() => {
        return !myIdentity?.identifier || !userId ? false : myIdentity.identifier.userId !== userId
    }, [myIdentity, userId])
    // Show connect result for the first time.
    const { loading: connecting } = useConnectPersona()

    const [, handleVerifyNextID] = useVerifyNextID()
    const [{ loading: verifying, value: verifiedSuccess }, onVerify] = useAsyncFn(async () => {
        if (!userId) return
        if (!personaInfo) return
        if (!nextIdPlatform) return

        const isBound = await NextIDProof.queryIsBound(personaInfo.identifier.publicKeyAsHex, nextIdPlatform, userId)
        if (!isBound) {
            await handleVerifyNextID(personaInfo, userId)
            Telemetry.captureEvent(EventType.Access, EventID.EntryPopupSocialAccountVerifyTwitter)
        }
        await queryClient.invalidateQueries({
            queryKey: ['@@next-id', 'bindings-by-persona', personaInfo.identifier.publicKeyAsHex],
        })

        await delay(1000)

        MaskMessages.events.ownProofChanged.sendToAll()
        return true
    }, [userId, personaInfo, queryClient])

    const notify = useNotifyConnected()

    const onConfirm = useCallback(() => {
        currentSetupGuideStatus[networkIdentifier].value = ''
        notify()
    }, [nextIdPlatform, notify])

    // Need to verify for next id platform
    if (currentUserId !== userId || loadingCurrentUserId || connecting) {
        return (
            <AccountConnectStatus
                expectAccount={userId}
                currentUserId={currentUserId}
                loading={loadingCurrentUserId || connecting}
                onClose={onClose}
            />
        )
    }

    if (!personaIdentifier) return null

    const disabled = !(userId || customUserId) || !personaName || disableVerify || checkingVerified

    return (
        <BindingDialog onClose={onClose}>
            <div className={classes.body}>
                <Box p={2} overflow="auto" className={classes.main}>
                    <Box className={classes.connection}>
                        {userId ?
                            <Box className={classes.connectItem}>
                                <Box width={36}>
                                    <img src={avatar} className={cx(classes.avatar, 'connected')} />
                                </Box>
                                <Box className={classes.info}>
                                    <Typography className={classes.name}>{username}</Typography>
                                    <Typography className={classes.second}>@{userId}</Typography>
                                </Box>
                            </Box>
                        :   <Box className={classes.connectItem}>
                                <Icons.Email size={24} />
                                <Box ml={0.5}>
                                    <MaskTextField
                                        placeholder="handle"
                                        className={classes.input}
                                        value={customUserId}
                                        onChange={(e) => {
                                            setCustomUserId(e.target.value.trim())
                                        }}
                                    />
                                </Box>
                            </Box>
                        }
                        <Icons.Connect size={24} />
                        <Box className={classes.connectItem}>
                            {personaAvatar ?
                                <img src={personaAvatar} className={cx(classes.avatar, 'connected')} />
                            :   <EmojiAvatar value={personaIdentifier.publicKeyAsHex} />}
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
                    {!nextIdPlatform || verified || verifiedSuccess ?
                        <Typography className={classes.text}>
                            {nextIdPlatform ?
                                <Trans>
                                    Sent verification post successfully.
                                    <br /> <br />
                                    You could check the verification result on Mask Pop-up after few minutes. If failed,
                                    try sending verification post again.
                                </Trans>
                            :   <Trans>
                                    Connected successfully. <br />
                                    <br />
                                    Trying exploring more features powered by Mask Network.
                                </Trans>
                            }
                        </Typography>
                    : creatingPostContent ?
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
                    : verifyInfo ?
                        <>
                            <Typography className={classes.postContentTitle}>
                                <Trans>Post content:</Trans>
                            </Typography>
                            <Typography className={classes.postContent}>{verifyInfo.post}</Typography>
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
                    {!nextIdPlatform || (nextIdPlatform && (verified || verifiedSuccess)) ?
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            disabled={disabled}
                            onClick={onConfirm}>
                            <Trans>OK</Trans>
                        </ActionButton>
                    :   <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            disabled={disabled}
                            loading={verifying}
                            onClick={onVerify}>
                            <Icons.Send size={18} className={classes.send} />
                            <Trans>Send</Trans>
                        </ActionButton>
                    }
                </Box>
            </div>
        </BindingDialog>
    )
}
