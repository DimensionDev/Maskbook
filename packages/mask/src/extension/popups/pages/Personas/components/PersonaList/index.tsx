import { memo, useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { PersonaContext } from '../../hooks/usePersonaContext'
import type { PersonaInformation, ECKeyIdentifier } from '@masknet/shared-base'
import { ListItemButton, List, Typography } from '@mui/material'
import { EditIcon, MasksIcon, SettingIcon, TickIcon } from '@masknet/icons'
import { formatFingerprint } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { useNavigate } from 'react-router-dom'
import Services from '../../../../../service'
import { useHover } from 'react-use'
import { CopyIconButton } from '../../../../components/CopyIconButton'

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
    tick: {
        fill: 'none',
        fontSize: 18,
    },
    edit: {
        fontSize: 16,
        stroke: '#1C68F3',
        fill: 'none',
        marginLeft: 10,
        cursor: 'pointer',
    },
    copy: {
        fontSize: 12,
        fill: '#1C68F3',
        marginLeft: 4,
        cursor: 'pointer',
    },
    setting: {
        fontSize: 12,
        cursor: 'pointer',
        fill: 'none',
        stroke: '#1C68F3',
        marginLeft: 4,
    },
}))

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

    const onChangeCurrentPersonas = useCallback(
        (identifier: ECKeyIdentifier) => Services.Settings.setCurrentPersonaIdentifier(identifier),
        [],
    )

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
                            isCurrent={currentPersona?.identifier.equals(identifier)}
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
                    <MasksIcon />
                </div>
                <div style={{ flex: 1 }}>
                    <Typography className={classes.name}>
                        {nickname}
                        {isHovering ? (
                            <EditIcon
                                className={classes.edit}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit()
                                }}
                            />
                        ) : null}
                    </Typography>
                    <Typography className={classes.identifier}>
                        {formatFingerprint(identifier.compressedPoint ?? '', 10)}
                        <CopyIconButton className={classes.copy} text={identifier.toText()} />
                        <SettingIcon
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
