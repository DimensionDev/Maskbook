import React from 'react'
import type { Persona } from '../../../database'
import { definedSocialNetworkWorkers } from '../../../social-network/worker'

import classNames from 'classnames'
import ProviderLine from './ProviderLine'
import { makeStyles } from '@material-ui/styles'
import { createStyles, Typography, Theme } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useColorProvider } from '../../../utils/theme'
import type { ProfileIdentifier } from '../../../database/type'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { ProfileDisconnectDialog, ProfileConnectDialog } from '../DashboardDialogs/Profile'
import getCurrentNetworkUI from '../../../social-network/utils/getCurrentNetworkUI'
import { currentImmersiveSetupStatus, ImmersiveSetupCrossContextStatus } from '../../../settings/settings'
import { exclusiveTasks } from '../../content-script/tasks'
import stringify from 'json-stable-stringify'
import { sleep } from '../../../utils/utils'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        line: {
            display: 'flex',
            alignItems: 'center',
            '&:not(:first-child)': {
                paddingTop: theme.spacing(1),
            },
            '& > div': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 1,
                whiteSpace: 'nowrap',
            },
            '& > .content': {
                margin: '0 1em',
            },
            '& > .title': {
                flexShrink: 0,
                width: '5rem',
            },
            '& > .extra-item': {
                marginRight: '0',
                flexShrink: 0,
                marginLeft: 'auto',
                cursor: 'pointer',
                fontSize: '0.8rem',
            },
            '&:hover': {
                '& > .extra-item': {
                    visibility: 'visible',
                },
            },
        },
        controlBorder: {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
    }),
)

interface Props {
    persona: Persona | null
    border?: true
}

export default function ProfileBox({ persona, border }: Props) {
    const { t } = useI18N()
    const classes = useStyles()
    const color = useColorProvider()
    const profiles = persona ? [...persona.linkedProfiles] : []

    const providers = [...definedSocialNetworkWorkers]
        .filter((i) => {
            if (webpackEnv.genericTarget === 'facebookApp') {
                if (i.networkIdentifier !== 'facebook.com') return false
            }
            return true
        })
        .map((i) => {
            const profile = profiles.find(([key, value]) => key.network === i.networkIdentifier)
            return {
                network: i.networkIdentifier,
                connected: !!profile,
                userId: profile?.[0].userId,
                identifier: profile?.[0],
            }
        })

    const [connectIdentifier, setConnectIdentifier] = React.useState<ProfileIdentifier | null>(null)
    const [detachProfile, setDetachProfile] = React.useState<ProfileIdentifier | null>(null)

    const deletedOrNot = () => setDetachProfile(null)
    const dismissConnect = () => {
        setConnectIdentifier(null)
    }

    const onConnect = async (provider: typeof providers[0]) => {
        if (!persona) return
        if (!(await getCurrentNetworkUI(provider.network).requestPermission())) return
        currentImmersiveSetupStatus[provider.network].value = stringify({
            status: 'during',
            persona: persona.identifier.toText(),
        } as ImmersiveSetupCrossContextStatus)
        await sleep(100)
        exclusiveTasks(getCurrentNetworkUI(provider.network).getHomePage(), {
            active: true,
            autoClose: false,
            important: true,
            memorable: false,
        }).immersiveSetup(persona.identifier)
    }

    return (
        <>
            {providers.map((provider) => (
                <Typography
                    key={`profile-line-${provider.network}`}
                    className={classNames(classes.line, { [classes.controlBorder]: border ?? true })}
                    component="div">
                    <ProviderLine onConnect={() => onConnect(provider)} {...provider}></ProviderLine>
                    {provider.connected && (
                        <div
                            className={classNames('extra-item', color.error)}
                            onClick={() => setDetachProfile(provider.identifier!)}>
                            {t('disconnect')}
                        </div>
                    )}
                </Typography>
            ))}
            {connectIdentifier && (
                <DialogRouter
                    onExit={dismissConnect}
                    children={
                        <ProfileConnectDialog
                            onClose={dismissConnect}
                            nickname={persona?.nickname!}
                            identifier={connectIdentifier}
                        />
                    }></DialogRouter>
            )}
            {detachProfile && (
                <DialogRouter
                    onExit={deletedOrNot}
                    children={
                        <ProfileDisconnectDialog
                            onConfirm={deletedOrNot}
                            onDecline={deletedOrNot}
                            nickname={persona?.nickname}
                            identifier={detachProfile}
                        />
                    }></DialogRouter>
            )}
        </>
    )
}
