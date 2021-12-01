import { memo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { PersonaContext } from '../hooks/usePersonaContext'
import { useHistory } from 'react-router-dom'
import { DeleteIcon, MasksIcon } from '@masknet/icons'
import { Button, Typography } from '@mui/material'
import { formatFingerprint } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { ChevronDown, ChevronUp } from 'react-feather'
import { ProfileList } from '../components/ProfileList'
import { EnterDashboard } from '../../../components/EnterDashboard'
import { PersonaList } from '../components/PersonaList'
import { useI18N } from '../../../../../utils'
import { EditIcon } from '@masknet/icons'
import urlcat from 'urlcat'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '12px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#EFF5FF',
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
        fontSize: 16,
        stroke: '#1C68F3',
        marginLeft: 6,
        cursor: 'pointer',
    },
    chevronIcon: {
        width: 18,
        height: 18,
        color: '#1C68F3',
        cursor: 'pointer',
    },
    controller: {
        padding: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: 20,
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    button: {
        fontWeight: 600,
        padding: '10px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    editIcon: {
        fontSize: 16,
        stroke: '#1C68F3',
        fill: 'none',
        marginLeft: 10,
        cursor: 'pointer',
    },
})

const PersonaHome = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [isExpand, setIsExpand] = useState(true)
    const { currentPersona, setDeletingPersona } = PersonaContext.useContainer()
    const history = useHistory()

    return (
        <>
            <div className={classes.content}>
                <div className={classes.header}>
                    <div style={{ display: 'flex' }}>
                        <div className={classes.iconContainer}>
                            <MasksIcon />
                        </div>
                        <div>
                            <Typography className={classes.name}>
                                {currentPersona?.nickname}
                                <EditIcon
                                    className={classes.editIcon}
                                    onClick={() => history.push(PopupRoutes.PersonaRename)}
                                />
                            </Typography>
                            <Typography className={classes.identifier}>
                                {formatFingerprint(currentPersona?.identifier.compressedPoint ?? '', 10)}
                                <DeleteIcon
                                    className={classes.trashIcon}
                                    onClick={() => {
                                        setDeletingPersona(currentPersona)
                                        history.push(PopupRoutes.Logout)
                                    }}
                                />
                            </Typography>
                        </div>
                    </div>
                    <div onClick={() => setIsExpand((pre) => !pre)}>
                        {isExpand ? (
                            <ChevronDown className={classes.chevronIcon} />
                        ) : (
                            <ChevronUp className={classes.chevronIcon} />
                        )}
                    </div>
                </div>
                {isExpand ? <ProfileList /> : <PersonaList />}
            </div>
            {isExpand ? (
                <EnterDashboard />
            ) : (
                <div className={classes.controller}>
                    <Button
                        variant="contained"
                        className={classes.button}
                        onClick={() => {
                            browser.tabs.create({
                                active: true,
                                url: browser.runtime.getURL('/dashboard.html#/sign-up'),
                            })
                        }}
                        style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}>
                        {t('create')}
                    </Button>
                    <Button
                        variant="contained"
                        className={classes.button}
                        onClick={() => {
                            browser.tabs.create({
                                active: true,
                                url: browser.runtime.getURL(urlcat('/dashboard.html#/sign-in', { from: 'popups' })),
                            })
                        }}>
                        {t('import')}
                    </Button>
                </div>
            )}
        </>
    )
})

export default PersonaHome
