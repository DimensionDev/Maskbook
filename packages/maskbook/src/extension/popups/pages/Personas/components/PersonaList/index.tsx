import { memo, useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { PersonaContext } from '../../hooks/usePersonaContext'
import type { PersonaInformation } from '@masknet/shared-base'
import { ListItemButton, List, Typography } from '@mui/material'
import { DeleteIcon, MasksIcon } from '@masknet/icons'
import { formatFingerprint } from '@masknet/shared'
import { PopupRoutes } from '../../../../index'
import { useHistory } from 'react-router-dom'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import Services from '../../../../../service'

const useStyles = makeStyles()((theme) => ({
    list: {
        padding: 0,
        height: 'calc(100vh - 185px)',
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
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '4px',
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: '#1C68F3',
        fontWeight: 500,
    },
    identifier: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
    },
    trashIcon: {
        fontSize: 12,
        stroke: '#1C68F3',
        marginLeft: 6,
        cursor: 'pointer',
    },
}))

export const PersonaList = memo(() => {
    const { personas, setDeletingPersona } = PersonaContext.useContainer()
    const history = useHistory()

    const onLogout = useCallback(
        (persona: PersonaInformation) => {
            setDeletingPersona(persona)
            history.push(PopupRoutes.Logout)
        },
        [setDeletingPersona],
    )

    const onChangeCurrentPersonas = useCallback(
        (identifier: ECKeyIdentifier) => Services.Settings.setCurrentPersonaIdentifier(identifier),
        [],
    )

    return <PersonaListUI personas={personas} onLogout={onLogout} onChangeCurrentPersona={onChangeCurrentPersonas} />
})

export interface PersonaListUIProps {
    personas?: PersonaInformation[]
    onChangeCurrentPersona: (identifier: ECKeyIdentifier) => void
    onLogout: (persona: PersonaInformation) => void
}

export const PersonaListUI = memo<PersonaListUIProps>(({ personas, onLogout, onChangeCurrentPersona }) => {
    const { classes } = useStyles()

    return (
        <List dense className={classes.list}>
            {personas?.map((persona, index) => {
                const { identifier, nickname } = persona
                return (
                    <ListItemButton
                        className={classes.item}
                        key={index}
                        onClick={() => onChangeCurrentPersona(identifier)}>
                        <div className={classes.iconContainer}>
                            <MasksIcon />
                        </div>
                        <div>
                            <Typography className={classes.name}>{nickname}</Typography>
                            <Typography className={classes.identifier}>
                                {formatFingerprint(identifier.compressedPoint ?? '', 10)}
                                <DeleteIcon
                                    className={classes.trashIcon}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onLogout(persona)
                                    }}
                                />
                            </Typography>
                        </div>
                    </ListItemButton>
                )
            })}
        </List>
    )
})
