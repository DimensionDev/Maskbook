import { memo } from 'react'
import { Avatar, Link, List, ListItem, ListItemText } from '@material-ui/core'
import { definedSocialNetworkUIs } from '../../../../../../social-network'
import { ProfileIdentifier, ProfileInformation, SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import { compact } from 'lodash-es'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../../../utils'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { useAsyncFn } from 'react-use'
import Services from '../../../../../service'
import { GrayMasks } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    list: {
        padding: 0,
    },
    item: {
        padding: '14px 16px',
        marginBottom: 1,
        backgroundColor: '#ffffff',
        '& > svg': {
            fontSize: 20,
            marginRight: 15,
        },
    },
    text: {
        fontWeight: 600,
        margin: 0,
    },
    link: {
        cursor: 'pointer',
    },
    avatarContainer: {
        marginRight: 15,
        position: 'relative',
    },
    avatar: {
        width: 20,
        height: 20,
    },
    circle: {
        backgroundColor: '#ffffff',
        height: 10,
        width: 10,
        borderRadius: 5,
        position: 'absolute',
        bottom: -3,
        right: -3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '& > svg': {
            fontSize: 9,
            width: 9,
            height: 9,
        },
    },
}))

export interface ProfileListProps {}

export const ProfileList = memo(() => {
    const { currentPersona } = PersonaContext.useContainer()

    const definedSocialNetworks = compact(
        [...definedSocialNetworkUIs.values()].map(({ networkIdentifier }) => {
            if (networkIdentifier === 'localhost') return null
            return networkIdentifier
        }),
    )

    const [, onConnect] = useAsyncFn(
        async (networkIdentifier: string) => {
            if (currentPersona) {
                await Services.SocialNetwork.connectSocialNetwork(currentPersona.identifier, networkIdentifier)
            }
        },
        [currentPersona],
    )

    const [, openProfilePage] = useAsyncFn(
        async (network: string, userId: string) => Services.SocialNetwork.openProfilePage(network, userId),
        [],
    )

    const [, onDisconnect] = useAsyncFn(async (identifier: ProfileIdentifier) =>
        Services.Identity.detachProfile(identifier),
    )

    return (
        <ProfileListUI
            networks={definedSocialNetworks}
            profiles={currentPersona?.linkedProfiles ?? []}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            openProfilePage={openProfilePage}
        />
    )
})

export interface ProfileListUIProps {
    onConnect: (networkIdentifier: string) => void
    onDisconnect: (identifier: ProfileIdentifier) => void
    openProfilePage: (network: string, userId: string) => void
    profiles: ProfileInformation[]
    networks: string[]
}

export const ProfileListUI = memo<ProfileListUIProps>(
    ({ networks, profiles, onConnect, onDisconnect, openProfilePage }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        console.log(profiles)
        return (
            <List dense className={classes.list}>
                {profiles.map(({ nickname, identifier, avatar }) => {
                    return (
                        <ListItem
                            className={classes.item}
                            key={identifier.toText()}
                            secondaryAction={
                                <Link
                                    className={classes.link}
                                    underline="none"
                                    onClick={() => onDisconnect(identifier)}>
                                    {t('popups_persona_disconnect')}
                                </Link>
                            }>
                            <div className={classes.avatarContainer}>
                                {avatar ? (
                                    <Avatar src={avatar} className={classes.avatar} />
                                ) : (
                                    <div className={classes.avatar}>
                                        <GrayMasks className={classes.avatar} />
                                    </div>
                                )}
                                <div className={classes.circle}>{SOCIAL_MEDIA_ICON_MAPPING[identifier.network]}</div>
                            </div>

                            <ListItemText
                                className={classes.text}
                                style={{ cursor: 'pointer' }}
                                onClick={() => openProfilePage(identifier.network, identifier.userId)}>
                                @{identifier.userId}
                            </ListItemText>
                        </ListItem>
                    )
                })}
                {networks.map((networkIdentifier) => {
                    return (
                        <ListItem
                            className={classes.item}
                            key={networkIdentifier}
                            style={{ cursor: 'pointer' }}
                            onClick={() => onConnect(networkIdentifier)}>
                            {SOCIAL_MEDIA_ICON_MAPPING[networkIdentifier]}
                            <ListItemText className={classes.text}>
                                {t('popups_persona_connect_to', { type: networkIdentifier })}
                            </ListItemText>
                        </ListItem>
                    )
                })}
            </List>
        )
    },
)
