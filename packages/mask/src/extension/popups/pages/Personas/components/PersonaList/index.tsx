// ! We're going to SSR this UI, so DO NOT import anything new!

import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { formatPersonaFingerprint, type PersonaInformation, type ECKeyIdentifier } from '@masknet/shared-base'
import { ListItemButton, List, Typography } from '@mui/material'
import { DeleteIcon, MasksIcon } from '@masknet/icons'

const useStyles = makeStyles()({
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
                                {formatPersonaFingerprint(identifier.compressedPoint ?? '', 10)}
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
