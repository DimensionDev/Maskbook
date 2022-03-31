// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import React, { memo, Suspense, useCallback, useState } from 'react'
import { Avatar, Link, List, ListItem, ListItemText, Typography } from '@mui/material'
import type { ProfileIdentifier, ProfileInformation, NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../../../utils/i18n-next-ui'
import { GrayMasks } from '@masknet/icons'
import { DisconnectDialog } from '../DisconnectDialog'

const useStyles = makeStyles()({
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
})

export interface ProfileListProps extends Omit<ProfileListUIProps, 'onDisconnect'> {
    onConfirmDisconnect(unbind: UnbindStatus): void
    onDisconnectProfile(identifier: ProfileIdentifier): void
    confirmLoading: boolean
    currentPersona: PersonaInformation | undefined
}

export type UnbindStatus = {
    identifier: ProfileIdentifier
    identity?: string
    platform?: NextIDPlatform
}
export const ProfileList = memo((props: ProfileListProps) => {
    const [unbind, setUnbind] = useState<UnbindStatus | null>(null)

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
            props.onDisconnectProfile(identifier)
        },
        [props.onDisconnectProfile],
    )

    return (
        <>
            <ProfileListUI
                definedSocialNetworks={props.definedSocialNetworks}
                mergedProfiles={props.mergedProfiles}
                onConnectNextID={props.onConnectNextID}
                onConnectProfile={props.onConnectProfile}
                onDisconnect={onDisconnect}
                openProfilePage={props.openProfilePage}
                SOCIAL_MEDIA_ICON_MAPPING={props.SOCIAL_MEDIA_ICON_MAPPING}
            />
            <Suspense fallback={null}>
                {unbind && (
                    <DisconnectDialog
                        currentPersona={props.currentPersona}
                        unbundledIdentity={unbind?.identifier}
                        open={!!unbind}
                        onClose={() => setUnbind(null)}
                        onConfirmDisconnect={() => props.onConfirmDisconnect(unbind)}
                        confirmLoading={props.confirmLoading}
                    />
                )}
            </Suspense>
        </>
    )
})

interface MergedProfileInformation extends ProfileInformation {
    is_valid?: boolean
    identity?: string
    platform?: NextIDPlatform
}

interface ProfileListUIProps {
    onConnectProfile(network: string): void
    onConnectNextID(profile: ProfileIdentifier): void
    onDisconnect(identifier: ProfileIdentifier, is_valid?: boolean, platform?: NextIDPlatform, identity?: string): void
    openProfilePage(profile: ProfileIdentifier): void
    mergedProfiles: MergedProfileInformation[]
    definedSocialNetworks: string[]
    SOCIAL_MEDIA_ICON_MAPPING: Record<string, React.ReactNode>
}

const ProfileListUI = memo((props: ProfileListUIProps) => {
    const {
        definedSocialNetworks,
        mergedProfiles: profiles,
        onConnectProfile,
        onConnectNextID,
        onDisconnect,
        openProfilePage,
        SOCIAL_MEDIA_ICON_MAPPING,
    } = props
    const { t } = useI18N()
    const { classes, cx } = useStyles()

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
                                    className={cx(
                                        classes.avatar,
                                        is_valid ? classes.verified_avatar : classes.unverified_avatar,
                                    )}
                                />
                            ) : (
                                <div className={classes.avatar}>
                                    <GrayMasks
                                        className={cx(
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
                            onClick={() => openProfilePage(identifier)}>
                            <Typography fontSize={12} fontWeight={600}>
                                @{identifier.userId}
                            </Typography>
                            {!is_valid && identifier.network === 'twitter.com' ? (
                                <Typography
                                    className={classes.tag}
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                        onConnectNextID(identifier)
                                        e.stopPropagation()
                                    }}>
                                    {t('popups_persona_to_be_verified')}
                                </Typography>
                            ) : null}
                        </ListItemText>
                    </ListItem>
                )
            })}
            {definedSocialNetworks.map((networkIdentifier) => {
                return (
                    <ListItem
                        className={classes.item}
                        key={networkIdentifier}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onConnectProfile(networkIdentifier)}>
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
})
