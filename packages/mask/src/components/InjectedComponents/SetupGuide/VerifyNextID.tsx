import { Icons } from '@masknet/icons'
import { EmojiAvatar, usePersonaProofs } from '@masknet/shared'
import { SetupGuideStep, currentSetupGuideStatus, formatPersonaFingerprint } from '@masknet/shared-base'
import { ActionButton, MaskColorVar, MaskTextField, makeStyles } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Box, Link, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import Services from '../../../../shared-ui/service.js'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/ui.js'
import { useMaskSharedTrans } from '../../../utils/i18n-next-ui.js'
import { useNextIDVerify } from '../../DataSource/useNextIDVerify.js'
import { AccountConnectStatus } from './AccountConnectStatus.js'
import { BindingDialog, type BindingDialogProps } from './BindingDialog.js'
import { SetupGuideContext } from './SetupGuideContext.js'
import { useConnectPersona } from './hooks/useConnectPersona.js'
import { useConnectedVerified } from './hooks/useConnectedVerified.js'
import { useCurrentUserId } from './hooks/useCurrentUserId.js'
import { useNotifyConnected } from './hooks/useNotifyConnected.js'
import { usePostContent } from './hooks/usePostContent.js'

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
    const { t } = useMaskSharedTrans()
    const { classes, cx } = useStyles()

    const { step, userId, currentIdentityResolved, destinedPersonaInfo } = SetupGuideContext.useContainer()
    const { nickname: username, avatar } = currentIdentityResolved
    const personaName = destinedPersonaInfo?.nickname
    const personaIdentifier = destinedPersonaInfo?.identifier

    const [customUserId, setCustomUserId] = useState('')
    const postContent = usePostContent(personaIdentifier, userId || customUserId)
    const [loadingCurrentUserId, currentUserId] = useCurrentUserId()
    const verified = useConnectedVerified(personaIdentifier?.publicKeyAsHex, userId)
    const { configuration, networkIdentifier } = activatedSiteAdaptorUI!
    const platform = configuration.nextIDConfig?.platform
    const [completed, setCompleted] = useState(!platform)

    const { data: personaAvatar } = useQuery({
        queryKey: ['my-own-persona-info'],
        queryFn: () => Services.Identity.queryOwnedPersonaInformation(false),
        select(data) {
            const pubkey = destinedPersonaInfo?.identifier.publicKeyAsHex
            const info = data.find((x) => x.identifier.publicKeyAsHex === pubkey)
            return info?.avatar
        },
    })

    const disableVerify = useMemo(() => {
        return !currentIdentityResolved?.identifier || !userId
            ? false
            : currentIdentityResolved.identifier.userId !== userId
    }, [currentIdentityResolved, userId])

    const [{ loading: connecting }, connectPersona] = useConnectPersona()
    // Loading proofs to check verification
    const { isLoading: isLoadingProofs } = usePersonaProofs(destinedPersonaInfo?.identifier.publicKeyAsHex)
    useEffect(() => {
        connectPersona()
    }, [connectPersona])

    const [, handleVerifyNextID] = useNextIDVerify()
    const [{ loading: verifying }, onVerify] = useAsyncFn(async () => {
        if (!userId) return
        if (!destinedPersonaInfo) return
        if (!platform) return

        const isBound = await NextIDProof.queryIsBound(
            destinedPersonaInfo.identifier.publicKeyAsHex,
            platform,
            userId,
            true,
        )
        if (isBound) return

        await handleVerifyNextID(destinedPersonaInfo, userId)
        Telemetry.captureEvent(EventType.Access, EventID.EntryPopupSocialAccountVerifyTwitter)
    }, [userId, destinedPersonaInfo])

    const notify = useNotifyConnected()
    const onVerifyDone = useCallback(() => {
        if (step !== SetupGuideStep.VerifyOnNextID) return
        currentSetupGuideStatus[networkIdentifier].value = ''
        notify()
    }, [step, notify])

    const executor = useCallback(async () => {
        if (platform) return onVerify()
        onVerifyDone?.()
        setCompleted(true)
    }, [onVerify, onVerifyDone])

    const buttonLabel = useMemo(() => {
        if (!platform || (platform && verified)) return t('ok')
        return (
            <>
                <Icons.Send size={18} className={classes.send} />
                {t('send')}
            </>
        )
    }, [platform, verified, t])

    if (currentUserId !== userId || loadingCurrentUserId || verified) {
        return (
            <AccountConnectStatus
                expectAccount={userId}
                currentUserId={currentUserId}
                loading={loadingCurrentUserId}
                connected={verified}
                onClose={onClose}
            />
        )
    }

    if (!personaIdentifier) return null

    const disabled = !(userId || customUserId) || !personaName || disableVerify
    const load = verifying || connecting || isLoadingProofs

    return (
        <BindingDialog onClose={onClose}>
            <div className={classes.body}>
                <Box p={2} overflow="auto" className={classes.main}>
                    <Box className={classes.connection}>
                        {userId ? (
                            <Box className={classes.connectItem}>
                                <Box width={36}>
                                    <img src={avatar} className={cx(classes.avatar, 'connected')} />
                                </Box>
                                <Box className={classes.info}>
                                    <Typography className={classes.name}>{username}</Typography>
                                    <Typography className={classes.second}>@{userId}</Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Box className={classes.connectItem}>
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
                        )}
                        <Icons.Connect size={24} />
                        <Box className={classes.connectItem}>
                            {personaAvatar ? (
                                <img src={personaAvatar} className={cx(classes.avatar, 'connected')} />
                            ) : (
                                <EmojiAvatar value={personaIdentifier.publicKeyAsHex} />
                            )}
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
                    {completed ? (
                        <Typography className={classes.text}>
                            <Trans
                                i18nKey={platform ? 'send_post_successfully' : 'connect_successfully'}
                                components={{ br: <br /> }}
                            />
                        </Typography>
                    ) : postContent ? (
                        <>
                            <Typography className={classes.postContentTitle}>
                                {t('setup_guide_post_content')}
                            </Typography>
                            <Typography className={classes.postContent}>{postContent}</Typography>
                            <Typography className={classes.tip} component="div">
                                {t('setup_guide_verify_tip')}
                            </Typography>
                        </>
                    ) : null}
                </Box>

                <Box className={classes.footer}>
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        disabled={disabled}
                        loading={load}
                        onClick={executor}>
                        {buttonLabel}
                    </ActionButton>
                </Box>
            </div>
        </BindingDialog>
    )
}
