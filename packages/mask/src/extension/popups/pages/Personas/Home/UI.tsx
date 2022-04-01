// ! We're going to SSR this UI, so DO NOT import anything new!

// TODO: Migrate following files before we can SSR
// ProfileList
// useI18N

import { memo, useCallback, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { DeleteIcon, MasksIcon, EditIcon } from '@masknet/icons'
import { Button, Typography } from '@mui/material'
import {
    PopupRoutes,
    formatPersonaFingerprint,
    MAX_PERSONA_LIMIT,
    PersonaInformation,
    ECKeyIdentifier,
} from '@masknet/shared-base'
import { ChevronDown, ChevronUp } from 'react-feather'
import { ProfileList } from '../components/ProfileList'
import { EnterDashboard } from '../../../components/EnterDashboard'
import { PersonaListUI } from '../components/PersonaList'
import { useI18N } from '../../../../../utils/i18n-next-ui'
import urlcat from 'urlcat'
import type { NavigateFunction } from 'react-router-dom'

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
    secondaryButton: {
        backgroundColor: '#F7F9FA',
        color: '#1C68F3',
    },
})

export interface PersonaHomeUIProps {
    navigate: NavigateFunction
    currentPersona: PersonaInformation | undefined
    personas: PersonaInformation[] | undefined
    onChangeCurrentPersona: (identifier: ECKeyIdentifier) => void
    onDeletePersona: (persona: PersonaInformation | undefined) => void
}
export const PersonaHomeUI = memo((props: PersonaHomeUIProps) => {
    const { navigate, currentPersona, personas, onDeletePersona, onChangeCurrentPersona } = props

    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const [isExpand, setExpand] = useState(true)

    const onLogout = useCallback(
        (persona: PersonaInformation) => {
            onDeletePersona(persona)
            navigate(PopupRoutes.Logout)
        },
        [onDeletePersona],
    )
    const onLogoutCurrent = useCallback(() => currentPersona && onLogout(currentPersona), [onLogout, currentPersona])

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
                                    onClick={() => navigate(PopupRoutes.PersonaRename)}
                                />
                            </Typography>
                            <Typography className={classes.identifier}>
                                {formatPersonaFingerprint(currentPersona?.identifier.compressedPoint ?? '', 10)}
                                <DeleteIcon className={classes.trashIcon} onClick={onLogoutCurrent} />
                            </Typography>
                        </div>
                    </div>
                    <div onClick={() => setExpand((pre) => !pre)}>
                        {isExpand ? (
                            <ChevronDown className={classes.chevronIcon} />
                        ) : (
                            <ChevronUp className={classes.chevronIcon} />
                        )}
                    </div>
                </div>
                {isExpand ? (
                    <ProfileList />
                ) : (
                    <PersonaListUI
                        onLogout={onLogout}
                        personas={personas}
                        onChangeCurrentPersona={onChangeCurrentPersona}
                    />
                )}
            </div>
            {isExpand ? (
                <EnterDashboard />
            ) : (
                <div className={classes.controller}>
                    <Button
                        variant="contained"
                        className={cx(classes.button, classes.secondaryButton)}
                        disabled={personas && personas.length >= MAX_PERSONA_LIMIT - 1}
                        onClick={() => {
                            browser.tabs.create({
                                active: true,
                                url: browser.runtime.getURL('/dashboard.html#/sign-up'),
                            })
                        }}>
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
