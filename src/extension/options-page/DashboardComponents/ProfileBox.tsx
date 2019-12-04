import React from 'react'
import { Persona } from '../../../database'
import { definedSocialNetworkWorkers } from '../../../social-network/worker'

import classNames from 'classnames'
import ProviderLine from './ProviderLine'
import { makeStyles } from '@material-ui/styles'
import { createStyles, Typography, Theme } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import { useColorProvider } from '../../../utils/theme'
import { ProfileIdentifier } from '../../../database/type'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { ProfileDisconnectDialog, ProfileConnectStartDialog, ProfileConnectDialog } from '../DashboardDialogs/Profile'
import Services from '../../service'

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
                visibility: 'hidden',
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
    }),
)

interface Props {
    persona: Persona | null
    border?: true
}

export default function ProfileBox({ persona, border }: Props) {
    const classes = useStyles()
    const color = useColorProvider()
    const profiles = persona ? [...persona.linkedProfiles] : []

    const providers = [...definedSocialNetworkWorkers].map(i => {
        const profile = profiles.find(([key, value]) => key.network === i.networkIdentifier)
        return {
            network: i.networkIdentifier,
            connected: !!profile,
            userId: profile?.[0].userId,
            identifier: profile?.[0],
        }
    })

    const [connectProfile, setConnectProfile] = React.useState<typeof providers[0] | null>(null)
    const [connectIdentifier, setConnectIdentifier] = React.useState<ProfileIdentifier | null>(null)
    const [detachProfile, setDetachProfile] = React.useState<ProfileIdentifier | null>(null)

    const deletedOrNot = () => setDetachProfile(null)
    const dismissConnect = () => {
        setConnectIdentifier(null)
        setConnectProfile(null)
    }

    const doConnect = async (userId: string) => {
        const identifier = new ProfileIdentifier(connectProfile!.network, userId)
        await Services.Identity.attachProfile(identifier, persona!.identifier, { connectionConfirmState: 'pending' })
        setConnectIdentifier(identifier)
    }

    return (
        <>
            {providers.map(provider => (
                <Typography className={classes.line} component="div">
                    <ProviderLine
                        onConnect={() => setConnectProfile(provider)}
                        {...provider}
                        border={border ?? false}></ProviderLine>
                    {provider.connected && (
                        <div
                            className={classNames('extra-item', color.error)}
                            onClick={() => setDetachProfile(provider.identifier!)}>
                            {geti18nString('disconnect')}
                        </div>
                    )}
                </Typography>
            ))}
            {connectProfile && (
                <DialogRouter
                    onExit={dismissConnect}
                    children={
                        <ProfileConnectStartDialog
                            nickname={persona?.nickname}
                            network={connectProfile.network}
                            confirmed={doConnect}
                        />
                    }></DialogRouter>
            )}
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
