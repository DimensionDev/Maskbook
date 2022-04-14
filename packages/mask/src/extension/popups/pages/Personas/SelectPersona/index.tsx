import { memo } from 'react'
import { PersonaList } from '../components/PersonaList'
import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import classNames from 'classnames'
import { PersonaContext } from '../hooks/usePersonaContext'
import { MAX_PERSONA_LIMIT } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { useI18N } from '../../../../../utils'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
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
        '&: hover': {
            backgroundColor: '#dee0e1',
        },
    },
})

const SelectPersona = memo(() => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { personas } = PersonaContext.useContainer()

    return (
        <>
            <div className={classes.content}>
                <PersonaList />
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={classNames(classes.button, classes.secondaryButton)}
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
        </>
    )
})

export default SelectPersona
