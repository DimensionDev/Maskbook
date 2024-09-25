import { memo, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEverSeen } from '@masknet/shared-base-ui'
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { Icons } from '@masknet/icons'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { Box, Typography, Link, useTheme, ButtonBase as Button, Avatar } from '@mui/material'
import {
    formatPersonaFingerprint,
    PopupRoutes,
    ProfileIdentifier,
    ECKeyIdentifier,
    NextIDPlatform,
} from '@masknet/shared-base'
import { CopyButton, PersonaContext } from '@masknet/shared'
import Services from '#services'
import { ConnectedAccounts } from './ConnectedAccounts/index.js'
import { attachNextIDToProfile } from '../../../../shared/index.js'
import { type Friend, useFriendProfiles } from '../../../hooks/index.js'
import { type Profile } from '../common.js'
import { Trans } from '@lingui/macro'

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
}))

interface ContactCardProps {
    avatar?: string
    proofProfiles?: Profile[]
    nextId?: string
    publicKey?: string
    isLocal?: boolean
    profile?: ProfileIdentifier
    refetch?: () => void
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
    const profiles = useFriendProfiles(seen, nextId, profile)
    const rawPublicKey = currentPersona?.identifier.rawPublicKey
    const queryClient = useQueryClient()

    const friendInfo = useMemo(() => {
        if (!rawPublicKey) return
        const twitter = proofProfiles?.find((p) => p.platform === NextIDPlatform.Twitter)
        const personaIdentifier = ECKeyIdentifier.fromHexPublicKeyK256(nextId).expect(
            `${nextId} should be a valid hex public key in k256`,
        )
        if (!twitter) {
            return {
                persona: personaIdentifier,
            }
        } else {
            const profileIdentifier = ProfileIdentifier.of('twitter.com', twitter.identity).unwrap()
            return {
                persona: personaIdentifier,
                profile: profileIdentifier,
            }
        }
    }, [profiles, nextId, rawPublicKey])

    const handleAddFriend = useCallback(async () => {
        if (!friendInfo || !currentPersona) return
        const { persona, profile } = friendInfo
        if (!profile) {
            await Services.Identity.createNewRelation(persona, currentPersona.identifier)
        } else {
            await attachNextIDToProfile({
                identifier: profile,
                linkedPersona: persona,
                fromNextID: true,
                linkedTwitterNames: [profile.userId],
            })
        }
    }, [nextId, queryClient, currentPersona, refetch, friendInfo])

    const { mutate: onAdd, isPending } = useMutation({
        mutationFn: handleAddFriend,
        onMutate: async (friend: Friend | undefined) => {
            if (!friend) return
            await queryClient.cancelQueries({ queryKey: ['relation-records', rawPublicKey] })
            await queryClient.cancelQueries({ queryKey: ['friends', rawPublicKey] })
            queryClient.setQueryData(
                ['friends', rawPublicKey],
                (
                    oldData:
                        | InfiniteData<{
                              friends: Friend[]
                              nextPageOffset: number
                          }>
                        | undefined,
                ) => {
                    if (!oldData) return undefined
                    return {
                        ...oldData,
                        pages:
                            oldData.pages[0] ?
                                [
                                    { friends: [friend, ...oldData.pages[0].friends], nextPageOffset: 10 },
                                    ...oldData.pages.slice(1),
                                ]
                            :   [{ friends: [friend], nextPageOffset: 0 }],
                    }
                },
            )
            showSnackbar(<Trans>Added successfully</Trans>, { variant: 'success' })
            setLocal(true)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ['relation-records', rawPublicKey] })
            await queryClient.invalidateQueries({ queryKey: ['friends', rawPublicKey] })
            refetch?.()
        },
    })

    return (
        <Box className={classes.card} ref={ref}>
            <Box className={classes.titleWrap}>
                <Box className={classes.title}>
                    {avatar ?
                        <Avatar className={classes.avatar} src={avatar} />
                    :   <Icons.NextIdAvatar className={classes.avatar} />}
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
                                href={`https://web3.bio/${nextId}`}
                                className={classes.icon}>
                                <Icons.LinkOut size={12} />
                            </Link>
                        </Typography>
                    </Box>
                </Box>
                {isLocal || local ?
                    <Button
                        onClick={() =>
                            navigate(`${PopupRoutes.FriendsDetail}/${nextId}`, {
                                state: {
                                    avatar,
                                    publicKey,
                                    nextId,
                                    profiles: proofProfiles ?? profiles,
                                    isLocal,
                                    localProfile: profile,
                                },
                            })
                        }
                        color="inherit"
                        style={{ borderRadius: '50%' }}>
                        <Icons.ArrowRight />
                    </Button>
                :   <ActionButton
                        variant="roundedContained"
                        onClick={() => onAdd(friendInfo)}
                        loading={isPending}
                        disabled={isPending}>
                        <Trans>Add</Trans>
                    </ActionButton>
                }
            </Box>
            <ConnectedAccounts
                avatar={avatar}
                nextId={nextId}
                publicKey={publicKey}
                isLocal={isLocal}
                profiles={proofProfiles ?? profiles}
                localProfile={profile}
            />
        </Box>
    )
})
ContactCard.displayName = 'ContactCard'
