import { memo } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import { ConnectedPersonaLine, UnconnectedPersonaLine } from '../PersonaLine'
import {
    type NextIDPersonaBindings,
    type PersonaIdentifier,
    type ProfileIdentifier,
    type ProfileInformation,
    formatPersonaFingerprint,
} from '@masknet/shared-base'
import { PersonaContext } from '../../hooks/usePersonaContext'
import type { SocialNetwork } from '../../api'
import classNames from 'classnames'
import { usePersonaProof } from '../../hooks/usePersonaProof'

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
    publicKey: string
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
    onConnect: (
        identifier: PersonaIdentifier,
        networkIdentifier: string,
        type?: 'local' | 'nextID',
        profile?: ProfileIdentifier,
    ) => void
    onDisconnect: (identifier: ProfileIdentifier) => void
    verification?: NextIDPersonaBindings
}

export const PersonaCardUI = memo<PersonaCardUIProps>((props) => {
    const { nickname, active = false, definedSocialNetworks, identifier, profiles, publicKey } = props
    const { onConnect, onDisconnect, onClick } = props
    const { classes } = useStyles()
    const proof = usePersonaProof(publicKey)
    return (
        <div className={classes.card}>
            <div className={classNames(classes.status, active ? classes.statusActivated : classes.statusInactivated)} />
            <div style={{ flex: 1 }}>
                <div className={classes.header}>
                    <Typography variant="subtitle2" sx={{ cursor: 'pointer' }} onClick={onClick}>
                        {nickname}
                    </Typography>
                    <Typography variant="caption" sx={{ cursor: 'pointer' }} onClick={onClick}>
                        {formatPersonaFingerprint(identifier.rawPublicKey, 4)}
                    </Typography>
                </div>
                <div className={classes.content}>
                    {definedSocialNetworks.map(({ networkIdentifier }) => {
                        const currentNetworkProfiles = profiles.filter(
                            (x) => x.identifier.network === networkIdentifier,
                        )

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
                                    proof={proof}
                                    isHideOperations
                                    key={networkIdentifier}
                                    onConnect={(type, profile) =>
                                        onConnect(identifier, networkIdentifier, type, profile)
                                    }
                                    onDisconnect={onDisconnect}
                                    profileIdentifiers={currentNetworkProfiles.map((x) => x.identifier)}
                                    networkIdentifier={networkIdentifier}
                                    personaIdentifier={identifier}
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
