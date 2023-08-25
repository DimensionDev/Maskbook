import { memo, useState, useCallback } from 'react'
import { Icons } from '@masknet/icons'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { Box, Typography, Link, useTheme, ButtonBase as Button, Avatar } from '@mui/material'
import {
    formatPersonaFingerprint,
    type BindingProof,
    PopupRoutes,
    ProfileIdentifier,
    ECKeyIdentifier,
} from '@masknet/shared-base'
import { CopyButton, PersonaContext } from '@masknet/shared'
import { useNavigate } from 'react-router-dom'
import { NextIDPlatform } from '@masknet/shared-base'
import { attachNextIDToProfile } from '../../../../../utils/utils.js'
import { ConnectedAccounts } from './ConnectedAccounts/index.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import Services from '../../../../service.js'
import { useEverSeen } from '@masknet/shared-base-ui'
import { useFriendProfiles } from '../../../hook/useFriendProfiles.js'
import { type UseQueryResult, type RefetchOptions } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import urlcat from 'urlcat'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: theme.palette.maskColor.line,
    },
    title: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    titleWrap: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '12px',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        background: theme.palette.maskColor.modalTitleBg,
    },
    avatar: {
        width: 40,
        height: 40,
    },
    icon: {
        width: 12,
        height: 12,
        fontSize: 12,
        color: theme.palette.maskColor.second,
    },
    addButton: {
        display: 'flex',
        padding: '8px 12px',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '99px',
        background: theme.palette.maskColor.main,
        color: theme.palette.maskColor.white,
        fontSize: '12px',
        lineHeight: '16px',
        fontWeight: 700,
    },
}))

interface ContactCardProps {
    avatar?: string
    proofProfiles?: BindingProof[]
    nextId?: string
    publicKey?: string
    isLocal?: boolean
    profile?: ProfileIdentifier
    refetch?: (options?: RefetchOptions) => Promise<UseQueryResult>
}

export const ContactCard = memo<ContactCardProps>(function ContactCard({
    avatar,
    nextId,
    publicKey,
    isLocal,
    profile,
    refetch,
    proofProfiles,
}) {
    const theme = useTheme()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { showSnackbar } = usePopupCustomSnackbar()
    const [local, setLocal] = useState(false)
    const [seen, ref] = useEverSeen<HTMLLIElement>()
    const { currentPersona } = PersonaContext.useContainer()
    const { t } = useI18N()
    const profiles = useFriendProfiles(seen, nextId, profile?.userId)
    const queryClient = useQueryClient()
    const handleAddFriend = useCallback(async () => {
        if (!currentPersona) return
        const twitter = profiles?.find((p) => p.platform === NextIDPlatform.Twitter)
        const personaIdentifier = ECKeyIdentifier.fromHexPublicKeyK256(nextId).expect(
            `${nextId} should be a valid hex public key in k256`,
        )
        const rawPublicKey = currentPersona.identifier.rawPublicKey
        if (!twitter) {
            await Services.Identity.createNewRelation(personaIdentifier, currentPersona.identifier)
        } else {
            const profileIdentifier = ProfileIdentifier.of('twitter.com', twitter.identity).unwrap()
            await attachNextIDToProfile({
                identifier: profileIdentifier,
                linkedPersona: personaIdentifier,
                fromNextID: true,
                linkedTwitterNames: twitter ? [twitter.identity] : [],
            })
        }
        showSnackbar(t('popups_encrypted_friends_added_successfully'), { variant: 'success' })
        setLocal(true)
        queryClient.invalidateQueries(['relation-records', rawPublicKey])
        queryClient.invalidateQueries(['friends', rawPublicKey])
        refetch?.()
    }, [profiles, nextId, currentPersona, queryClient])
    console.log(profiles)
    return (
        <Box className={classes.card} ref={ref}>
            <Box className={classes.titleWrap}>
                <Box className={classes.title}>
                    {avatar ? (
                        <Avatar className={classes.avatar} src={avatar} />
                    ) : (
                        <Icons.NextIdAvatar className={classes.avatar} />
                    )}
                    <Box>
                        <Typography fontSize={14} fontWeight={700} lineHeight="18px">
                            {publicKey ? formatPersonaFingerprint(publicKey) : null}
                        </Typography>
                        <Typography
                            fontSize={12}
                            color={theme.palette.maskColor.second}
                            lineHeight="16px"
                            display="flex"
                            alignItems="center"
                            columnGap="2px">
                            {nextId ? formatPersonaFingerprint(nextId, 4) : null}
                            <CopyButton text={nextId ? nextId : ''} size={12} className={classes.icon} />
                            <Link
                                underline="none"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={urlcat('https://web3.bio/', { s: nextId })}
                                className={classes.icon}>
                                <Icons.LinkOut size={12} />
                            </Link>
                        </Typography>
                    </Box>
                </Box>
                {isLocal || local ? (
                    <Button
                        onClick={() =>
                            navigate(`${PopupRoutes.FriendsDetail}/${nextId}`, {
                                state: {
                                    avatar,
                                    publicKey,
                                    nextId,
                                    profiles,
                                    isLocal,
                                },
                            })
                        }
                        color="inherit"
                        style={{ borderRadius: '50%' }}>
                        <Icons.ArrowRight />
                    </Button>
                ) : (
                    <Button className={classes.addButton} onClick={handleAddFriend}>
                        {t('popups_encrypted_friends_add_friends')}
                    </Button>
                )}
            </Box>
            <ConnectedAccounts
                avatar={avatar}
                nextId={nextId}
                publicKey={publicKey}
                isLocal={isLocal}
                profiles={proofProfiles ? proofProfiles : profiles}
            />
        </Box>
    )
})
