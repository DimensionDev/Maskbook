// ! We're going to SSR this UI, so DO NOT import anything new!
import { memo, useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import {
    formatPersonaFingerprint,
    type PersonaInformation,
    type ECKeyIdentifier,
    PopupRoutes,
} from '@masknet/shared-base'
import { ListItemButton, List, Typography } from '@mui/material'
import { EditIcon, MasksIcon, TickIcon } from '@masknet/icons'
import { useNavigate } from 'react-router-dom'
import Services from '../../../../../service'
import { useHover } from 'react-use'
import { CopyIconButton } from '../../../../components/CopyIconButton'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { Trash2 } from 'react-feather'

const useStyles = makeStyles()({
    list: {
        padding: 0,
        overflow: 'auto',
    },
    item: {
        padding: '14px 16px',
        marginBottom: 1,
        backgroundColor: '#ffffff',
        '& > svg': {
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
        marginLeft: 6,
        cursor: 'pointer',
        width: 12,
        height: 12,
    },
    tick: {
        fill: 'none',
        fontSize: 18,
    },
    edit: {
        color: '#1C68F3',
        marginLeft: 10,
        cursor: 'pointer',
    },
    copy: {
        width: 12,
        height: 12,
        color: '#1C68F3',
        marginLeft: 4,
        cursor: 'pointer',
    },
})

export const PersonaList = memo(() => {
    const { personas, setSelectedPersona, currentPersona } = PersonaContext.useContainer()
    const navigate = useNavigate()

    const onLogout = useCallback(
        (persona: PersonaInformation) => {
            setSelectedPersona(persona)
            navigate(PopupRoutes.Logout)
        },
        [setSelectedPersona],
    )

    const onChangeCurrentPersonas = useCallback((identifier: ECKeyIdentifier) => {
        Services.Settings.setCurrentPersonaIdentifier(identifier).then(() => navigate(PopupRoutes.Personas))
    }, [])

    const onEdit = useCallback((persona: PersonaInformation) => {
        setSelectedPersona(persona)
        navigate(PopupRoutes.PersonaRename)
    }, [])

    return (
        <PersonaListUI
            currentPersona={currentPersona}
            personas={personas}
            onLogout={onLogout}
            onChangeCurrentPersona={onChangeCurrentPersonas}
            onEdit={onEdit}
        />
    )
})

export interface PersonaListUIProps {
    currentPersona?: PersonaInformation
    personas?: PersonaInformation[]
    onChangeCurrentPersona: (identifier: ECKeyIdentifier) => void
    onLogout: (persona: PersonaInformation) => void
    onEdit: (persona: PersonaInformation) => void
}

export const PersonaListUI = memo<PersonaListUIProps>(
    ({ personas, onLogout, onChangeCurrentPersona, currentPersona, onEdit }) => {
        const { classes } = useStyles()

        return (
            <List dense className={classes.list}>
                {personas?.map((persona, index) => {
                    const { identifier, nickname } = persona
                    return (
                        <PersonaListItem
                            key={index}
                            onChange={() => onChangeCurrentPersona(identifier)}
                            onEdit={() => onEdit(persona)}
                            onLogout={() => onLogout(persona)}
                            identifier={identifier}
                            isCurrent={currentPersona?.identifier === identifier}
                            nickname={nickname}
                        />
                    )
                })}
            </List>
        )
    },
)

interface PersonaListItemProps {
    onChange: () => void
    onEdit: () => void
    onLogout: () => void
    nickname?: string
    identifier: ECKeyIdentifier
    isCurrent?: boolean
}

const PersonaListItem = memo<PersonaListItemProps>(
    ({ onChange, nickname, identifier, isCurrent, onLogout, onEdit }) => {
        const { classes } = useStyles()
        const [element] = useHover((isHovering) => (
            <ListItemButton className={classes.item} onClick={() => onChange()}>
                <div className={classes.iconContainer}>
                    <MasksIcon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <Typography className={classes.name}>
                        {nickname}
                        {isHovering ? (
                            <EditIcon
                                size={16}
                                className={classes.edit}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit()
                                }}
                            />
                        ) : null}
                    </Typography>
                    <Typography className={classes.identifier}>
                        {formatPersonaFingerprint(identifier.rawPublicKey ?? '', 10)}
                        <CopyIconButton className={classes.copy} text={identifier.toText()} />
                        <Trash2
                            className={classes.trashIcon}
                            onClick={(e) => {
                                e.stopPropagation()
                                onLogout()
                            }}
                        />
                    </Typography>
                </div>
                {isCurrent ? <TickIcon className={classes.tick} /> : null}
            </ListItemButton>
        ))

        return element
    },
)
