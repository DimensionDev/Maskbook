import { memo } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import { ConnectedPersonaLine, UnconnectedPersonaLine } from '../PersonaLine'
import type { PersonaIdentifier, ProfileIdentifier, ProfileInformation } from '@masknet/shared'
import { formatFingerprint } from '@masknet/shared'
import { PersonaContext } from '../../hooks/usePersonaContext'
import type { SocialNetwork } from '../../api'
import classNames from 'classnames'

const useStyles = makeStyles()((theme) => ({
    card: {
        borderRadius: Number(theme.shape.borderRadius) * 3,
        backgroundColor: MaskColorVar.primaryBackground,
        display: 'flex',
        padding: theme.spacing(1.25),
        minWidth: 320,
    },
    status: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        marginRight: theme.spacing(1.25),
        marginTop: theme.spacing(0.625),
    },
    statusInactivated: {
        backgroundColor: MaskColorVar.iconLight,
    },
    statusActivated: {
        backgroundColor: MaskColorVar.greenMain,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: theme.typography.caption.fontSize,
    },
    content: {
        marginTop: theme.spacing(1.25),
        paddingRight: theme.spacing(1.25),
    },
    line: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: theme.typography.caption.fontSize,
    },
    setting: {
        fontSize: theme.typography.caption.fontSize,
        padding: 0,
    },
}))

export interface PersonaCardProps {
    nickname?: string
    active?: boolean
    identifier: PersonaIdentifier
    profiles: ProfileInformation[]
    onClick(): void
}

export const PersonaCard = memo<PersonaCardProps>((props) => {
    const { connectPersona, disconnectPersona, definedSocialNetworks } = PersonaContext.useContainer()

    return (
        <PersonaCardUI
            {...props}
            onConnect={connectPersona}
            onDisconnect={disconnectPersona}
            definedSocialNetworks={definedSocialNetworks}
        />
    )
})

export interface PersonaCardUIProps extends PersonaCardProps {
    definedSocialNetworks: SocialNetwork[]
    onConnect: (identifier: PersonaIdentifier, networkIdentifier: string) => void
    onDisconnect: (identifier: ProfileIdentifier) => void
}

export const PersonaCardUI = memo<PersonaCardUIProps>((props) => {
    const { nickname, active = false, definedSocialNetworks, identifier, profiles } = props
    const { onConnect, onDisconnect, onClick } = props
    const { classes } = useStyles()

    return (
        <div className={classes.card}>
            <div className={classNames(classes.status, active ? classes.statusActivated : classes.statusInactivated)} />
            <div style={{ flex: 1 }}>
                <div className={classes.header}>
                    <Typography variant="subtitle2" sx={{ cursor: 'pointer' }} onClick={onClick}>
                        {nickname}
                    </Typography>
                    <Typography variant="caption" sx={{ cursor: 'pointer' }} onClick={onClick}>
                        {formatFingerprint(identifier.compressedPoint, 4)}
                    </Typography>
                </div>
                <div className={classes.content}>
                    {definedSocialNetworks.map(({ networkIdentifier }) => {
                        const currentNetworkProfiles = profiles.filter(
                            (x) => x.identifier.network === networkIdentifier,
                        )

                        currentNetworkProfiles.map(() => {})
                        if (!currentNetworkProfiles.length) {
                            return (
                                <UnconnectedPersonaLine
                                    key={networkIdentifier}
                                    onConnect={() => onConnect(identifier, networkIdentifier)}
                                    networkIdentifier={networkIdentifier}
                                />
                            )
                        } else {
                            return (
                                <ConnectedPersonaLine
                                    isHideOperations
                                    key={networkIdentifier}
                                    onConnect={() => onConnect(identifier, networkIdentifier)}
                                    onDisconnect={onDisconnect}
                                    profileIdentifiers={currentNetworkProfiles.map((x) => x.identifier)}
                                    networkIdentifier={networkIdentifier}
                                />
                            )
                        }
                    })}
                </div>
            </div>
        </div>
    )
})

export * as PersonaRowCard from './Row'
