import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { MasksIcon } from '@masknet/icons'
import { Typography } from '@mui/material'
import { formatFingerprint } from '@masknet/shared'
import { DeleteIcon } from '@masknet/icons'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../../index'

const useStyles = makeStyles()({
    header: {
        padding: '12px 10px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#EFF5FF',
    },
    left: {
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
        fontSize: 16,
        stroke: '#1C68F3',
        marginLeft: 6,
        cursor: 'pointer',
    },
})

export const PersonaHeader = memo(() => {
    const { classes } = useStyles()
    const { currentPersona } = PersonaContext.useContainer()
    const history = useHistory()
    return (
        <div className={classes.header}>
            <div className={classes.left}>
                <MasksIcon />
            </div>
            <div>
                <Typography className={classes.name}>{currentPersona?.nickname}</Typography>
                <Typography className={classes.identifier}>
                    {formatFingerprint(currentPersona?.identifier.compressedPoint ?? '', 10)}
                    <DeleteIcon className={classes.trashIcon} onClick={() => history.push(PopupRoutes.Logout)} />
                </Typography>
            </div>
        </div>
    )
})
