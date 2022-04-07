import { memo, useCallback, useState } from 'react'
import { Avatar, Link, List, ListItem, ListItemText, Typography } from '@mui/material'
import { definedSocialNetworkUIs } from '../../../../../../social-network'
import { SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import {
    ProfileIdentifier,
    ProfileInformation,
    EnhanceableSite,
    NextIDAction,
    NextIDPlatform,
    PopupRoutes,
} from '@masknet/shared-base'
import { compact } from 'lodash-unified'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../../../utils'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import Services from '../../../../../service'
import { GrayMasks } from '@masknet/icons'
import { DisconnectDialog } from '../DisconnectDialog'
import { NextIDProof } from '@masknet/web3-providers'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { MethodAfterPersonaSign } from '../../../Wallet/type'

const useStyles = makeStyles()((theme) => ({
    list: {
        padding: '0 0 70px 0',
        height: 487,
        overflow: 'auto',
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
        '& > span': {
            display: 'flex',
            alignItems: 'center',
        },
    },
    link: {
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 12,
    },
    avatarContainer: {
        marginRight: 15,
        position: 'relative',
    },
    avatar: {
        width: 20,
        height: 20,
        borderRadius: '50%',
    },
    verified_avatar: {
        border: '1px solid #60DFAB',
    },
    unverified_avatar: {
        border: '1px solid #FFB915',
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
    tag: {
        background: 'linear-gradient(0deg, rgba(255, 177, 0, 0.2), rgba(255, 177, 0, 0.2)), #FFFFFF',
        padding: 4,
        color: '#FFB100',
        fontSize: 10,
        lineHeight: 1,
        borderRadius: 4,
        marginLeft: 6,
    },
}))

export interface ProfileListProps {}

export const ProfileList = memo(() => {
    const { currentPersona } = PersonaContext.useContainer()

    const navigate = useNavigate()
    const [unbind, setUnbind] = useState<{
        identifier: ProfileIdentifier
        identity?: string
        platform?: NextIDPlatform
    } | null>(null)

    const definedSocialNetworks = compact(
        [...definedSocialNetworkUIs.values()].map(({ networkIdentifier }) => {
            if (networkIdentifier === EnhanceableSite.Localhost) return null
            return networkIdentifier
        }),
    )

    const [, onConnect] = useAsyncFn(
        async (networkIdentifier: string, type?: 'local' | 'nextID', profile?: ProfileIdentifier) => {
            if (currentPersona) {
                await Services.SocialNetwork.connectSocialNetwork(
                    currentPersona.identifier,
                    networkIdentifier,
                    type,
                    profile,
                )
            }
        },
        [currentPersona],
    )

    const [, openProfilePage] = useAsyncFn(
        async (network: string, userId: string) => Services.SocialNetwork.openProfilePage(network, userId),
        [],
    )

    const onDisconnect = useCallback(
        (identifier: ProfileIdentifier, is_valid?: boolean, platform?: NextIDPlatform, identity?: string) => {
            if (is_valid) {
                setUnbind({
                    identifier,
                    platform,
                    identity,
                })
                return
            }
            Services.Identity.detachProfile(identifier)
        },
        [],
    )

    const { value: mergedProfiles, retry: refreshProfileList } = useAsyncRetry(async () => {
        if (!currentPersona) return []
        if (!currentPersona.publicHexKey) return currentPersona.linkedProfiles
        const response = await NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey)
        if (!response) return currentPersona.linkedProfiles

        return currentPersona.linkedProfiles.map((profile) => {
            const target = response.proofs.find(
                (x) =>
                    profile.identifier.userId.toLowerCase() === x.identity.toLowerCase() &&
                    profile.identifier.network.replace('.com', '') === x.platform,
            )

            return {
                ...profile,
                platform: target?.platform,
                identity: target?.identity,
                is_valid: target?.is_valid,
            }
        })
    }, [currentPersona])

    const [confirmState, onConfirmDisconnect] = useAsyncFn(async () => {
        // fetch signature payload
        try {
            if (!currentPersona) return
            const publicHexKey = currentPersona.publicHexKey

            if (!publicHexKey || !unbind || !unbind.identity || !unbind.platform) return
            const result = await NextIDProof.createPersonaPayload(
                publicHexKey,
                NextIDAction.Delete,
                unbind.identity,
                unbind.platform,
            )
            if (!result) return
            navigate(
                urlcat(PopupRoutes.PersonaSignRequest, {
                    requestID: Math.random().toString().slice(3),
                    message: result.signPayload,
                    identifier: currentPersona.identifier.toText(),
                    method: MethodAfterPersonaSign.DISCONNECT_NEXT_ID,
                    profileIdentifier: unbind.identifier.toText(),
                    platform: unbind.platform,
                    identity: unbind.identity,
                    createdAt: result.createdAt,
                    uuid: result.uuid,
                }),
            )
        } catch {
            console.log('Disconnect failed')
        }
    }, [unbind, currentPersona?.identifier, refreshProfileList])

    return (
        <>
            <ProfileListUI
                networks={definedSocialNetworks}
                profiles={mergedProfiles ?? []}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                openProfilePage={openProfilePage}
            />
            <DisconnectDialog
                unbundledIdentity={unbind?.identifier}
                open={!!unbind}
                onClose={() => setUnbind(null)}
                onConfirmDisconnect={onConfirmDisconnect}
                confirmLoading={confirmState.loading}
            />
        </>
    )
})

interface MergedProfileInformation extends ProfileInformation {
    is_valid?: boolean
    identity?: string
    platform?: NextIDPlatform
}

export interface ProfileListUIProps {
    onConnect: (networkIdentifier: string, type?: 'local' | 'nextID', profile?: ProfileIdentifier) => void
    onDisconnect: (
        identifier: ProfileIdentifier,
        is_valid?: boolean,
        platform?: NextIDPlatform,
        identity?: string,
    ) => void
    openProfilePage: (network: string, userId: string) => void
    profiles: MergedProfileInformation[]
    networks: string[]
}

export const ProfileListUI = memo<ProfileListUIProps>(
    ({ networks, profiles, onConnect, onDisconnect, openProfilePage }) => {
        const { t } = useI18N()
        const { classes } = useStyles()

        return (
            <List dense className={classes.list}>
                {profiles.map(({ identifier, avatar, is_valid, platform, identity }) => {
                    return (
                        <ListItem
                            className={classes.item}
                            key={identifier.toText()}
                            secondaryAction={
                                <Link
                                    className={classes.link}
                                    underline="none"
                                    onClick={() => onDisconnect(identifier, is_valid, platform, identity)}>
                                    {t('popups_persona_disconnect')}
                                </Link>
                            }>
                            <div className={classes.avatarContainer}>
                                {avatar ? (
                                    <Avatar
                                        src={avatar}
                                        className={classNames(
                                            classes.avatar,
                                            is_valid ? classes.verified_avatar : classes.unverified_avatar,
                                        )}
                                    />
                                ) : (
                                    <div className={classes.avatar}>
                                        <GrayMasks
                                            className={classNames(
                                                classes.avatar,
                                                is_valid ? classes.verified_avatar : classes.unverified_avatar,
                                            )}
                                        />
                                    </div>
                                )}
                                <div className={classes.circle}>{SOCIAL_MEDIA_ICON_MAPPING[identifier.network]}</div>
                            </div>

                            <ListItemText
                                className={classes.text}
                                style={{ cursor: 'pointer' }}
                                onClick={() => openProfilePage(identifier.network, identifier.userId)}>
                                <Typography fontSize={12} fontWeight={600}>
                                    @{identifier.userId}
                                </Typography>
                                {!is_valid && identifier.network === 'twitter.com' ? (
                                    <Typography
                                        className={classes.tag}
                                        style={{ cursor: 'pointer' }}
                                        onClick={(e) => {
                                            onConnect(identifier.network, 'nextID', identifier)
                                            e.stopPropagation()
                                        }}>
                                        {t('popups_persona_to_be_verified')}
                                    </Typography>
                                ) : null}
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
                                <Typography fontSize={12} fontWeight={600}>
                                    {t('popups_persona_connect_to', { type: networkIdentifier })}
                                </Typography>
                            </ListItemText>
                        </ListItem>
                    )
                })}
            </List>
        )
    },
)
