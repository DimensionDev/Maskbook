import { memo, useState, useCallback } from 'react'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, Link, useTheme, ButtonBase as Button, ButtonBase, Avatar } from '@mui/material'
import {
    formatPersonaFingerprint,
    type BindingProof,
    PopupRoutes,
    ProfileIdentifier,
    ECKeyIdentifier,
} from '@masknet/shared-base'
import { CopyButton, PersonaContext } from '@masknet/shared'
import urlcat from 'urlcat'
import { useNavigate } from 'react-router-dom'
import { TwitterAccount } from './TwitterAccount/index.js'
import { Account } from './Account/index.js'
import { NextIDPlatform } from '@masknet/shared-base'
import { attachNextIDToProfile } from '../../../../../utils/utils.js'
import Services from '../../../../service.js'

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
    connectedAccounts: {
        borderBottomLeftRadius: '6px',
        borderBottomRightRadius: '6px',
        background: theme.palette.maskColor.white,
        padding: '8px',
        position: 'relative',
    },
    more: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        background: 'rgba(28, 104, 243, 0.1)',
        borderRadius: '50%',
        position: 'absolute',
        right: '10px',
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
    profiles: BindingProof[]
    nextId: string
    publicKey?: string
    isLocal?: boolean
}

export const ContactCard = memo<ContactCardProps>(({ avatar, nextId, profiles, publicKey, isLocal }) => {
    const theme = useTheme()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const [local, setLocal] = useState(false)
    const { currentPersona } = PersonaContext.useContainer()
    const handleAddFriend = useCallback(() => {
        setLocal(true)
        const twitter = profiles.find((p) => p.platform === NextIDPlatform.Twitter)
        if (!twitter || !currentPersona) return
        const profileIdentifier = ProfileIdentifier.of('twitter.com', twitter.identity).unwrap()
        const personaIdentifier = ECKeyIdentifier.fromHexPublicKeyK256(nextId).expect(
            `${nextId} should be a valid hex public key in k256`,
        )
        console.log(profileIdentifier)
        attachNextIDToProfile({
            identifier: profileIdentifier,
            linkedPersona: personaIdentifier,
            fromNextID: true,
            linkedTwitterNames: [twitter.identity],
        })
        Services.Identity.queryProfilesInformation([profileIdentifier]).then((res) => {
            console.log(res)
        })
    }, [profiles, nextId, currentPersona])

    return (
        <Box className={classes.card}>
            <Box className={classes.titleWrap}>
                <Box className={classes.title}>
                    {avatar ? (
                        <Avatar className={classes.avatar} src={avatar} />
                    ) : (
                        <Icons.NextIdAvatar className={classes.avatar} />
                    )}
                    <Box>
                        <Typography fontSize={14} fontWeight={700} lineHeight="18px">
                            {publicKey ? formatPersonaFingerprint(publicKey, 4) : null}
                        </Typography>
                        <Typography
                            fontSize={12}
                            color={theme.palette.maskColor.second}
                            lineHeight="16px"
                            display="flex"
                            alignItems="center"
                            columnGap="2px">
                            {nextId ? formatPersonaFingerprint(nextId, 4) : null}
                            <CopyButton text={nextId} size={12} className={classes.icon} />
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
                        Add
                    </Button>
                )}
            </Box>
            <Box
                display="flex"
                gap="8px"
                alignItems="center"
                height="58px"
                className={classes.connectedAccounts}
                width="100%">
                {profiles.slice(0, 2).map((profile) => {
                    switch (profile.platform) {
                        case 'twitter':
                            return (
                                <TwitterAccount avatar={''} userId={profile.name ? profile.name : profile.identity} />
                            )
                        case 'ens':
                        case 'ethereum':
                        case 'github':
                        case 'space_id':
                        case 'lens':
                        case 'unstoppabledomains':
                        case 'farcaster':
                            return (
                                <Account
                                    userId={profile.platform === 'ens' ? profile.name : profile.identity}
                                    icon={profile.platform}
                                />
                            )
                        default:
                            return null
                    }
                })}
                {profiles.length > 2 ? (
                    <ButtonBase
                        className={classes.more}
                        onClick={() => {
                            navigate(`${PopupRoutes.FriendsDetail}/${nextId}`, {
                                state: {
                                    avatar,
                                    publicKey,
                                    nextId,
                                    profiles,
                                    isLocal,
                                },
                            })
                        }}>
                        <Typography
                            fontSize={12}
                            fontWeight={400}
                            lineHeight="16px"
                            color={theme.palette.maskColor.main}>
                            {`+${profiles.length - 2}`}
                        </Typography>
                    </ButtonBase>
                ) : null}
            </Box>
        </Box>
    )
})
