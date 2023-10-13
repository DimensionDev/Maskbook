import { Icons } from '@masknet/icons'
import { ActionButtonPromise, EmojiAvatar } from '@masknet/shared'
import { formatPersonaFingerprint, type PersonaIdentifier } from '@masknet/shared-base'
import { MaskColorVar, MaskTextField, makeStyles } from '@masknet/theme'
import { Box, Link, Typography } from '@mui/material'
import { useState } from 'react'
import { Trans } from 'react-i18next'
import { useMaskSharedTrans } from '../../../utils/index.js'
import { AccountConnectStatus } from './AccountConnectStatus.js'
import { BindingDialog, type BindingDialogProps } from './BindingDialog.js'
import { useCurrentUserId, usePersonaConnected, usePostContent } from './hooks.js'

export const useStyles = makeStyles()((theme) => ({
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
    name: {
        fontSize: 14,
        fontWeight: 500,
    },
    second: {
        color: theme.palette.maskColor.second,
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(0.5),
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

interface VerifyNextIDProps extends BindingDialogProps {
    username?: string
    userId: string
    personaName?: string
    personaIdentifier?: PersonaIdentifier
    network: string
    avatar?: string
    personaAvatar?: string
    disableVerify: boolean
    onVerify: () => Promise<void>
    onDone?: () => void
}

export function VerifyNextID({
    personaName,
    personaIdentifier,
    username,
    userId,
    avatar,
    personaAvatar,
    onVerify,
    onDone,
    onClose,
    disableVerify,
}: VerifyNextIDProps) {
    const { t } = useMaskSharedTrans()
    const { classes, cx } = useStyles()

    const [customUserId, setCustomUserId] = useState('')
    const postContent = usePostContent(personaIdentifier, userId || customUserId)
    const [loadingCurrentUserId, currentUserId] = useCurrentUserId()
    const connected = usePersonaConnected(personaIdentifier?.publicKeyAsHex, userId)
    const [completed, setCompleted] = useState(false)

    if (currentUserId !== userId || loadingCurrentUserId || connected) {
        return (
            <AccountConnectStatus
                expectAccount={userId}
                currentUserId={currentUserId}
                loading={loadingCurrentUserId}
                connected={connected}
                onClose={onClose}
            />
        )
    }

    if (!personaIdentifier) return null

    const buttonLabel = (
        <>
            <Icons.Send size={18} className={classes.send} />
            {t('send')}
        </>
    )
    const disabled = !(userId || customUserId) || !personaName || disableVerify

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
                                <Box ml={1}>
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
                            <Box ml={1}>
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
                            <Trans i18nKey="send_post_successfully" components={{ br: <br /> }} />
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
                    <ActionButtonPromise
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        init={buttonLabel}
                        waiting={buttonLabel}
                        complete={t('ok')}
                        failed={buttonLabel}
                        executor={onVerify}
                        completeOnClick={onDone}
                        disabled={disabled}
                        completeIcon={null}
                        failIcon={null}
                        failedOnClick="use executor"
                        data-testid="confirm_button"
                        onComplete={() => {
                            setCompleted(true)
                        }}
                    />
                </Box>
            </div>
        </BindingDialog>
    )
}
