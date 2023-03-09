import { memo } from 'react'
import { PersonaList } from '../components/PersonaList/index.js'
import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import { PersonaContext } from '../hooks/usePersonaContext.js'
import { MAX_PERSONA_LIMIT } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { useI18N } from '../../../../../utils/index.js'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 72,
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
    secondaryButton: {
        backgroundColor: '#F7F9FA',
        color: '#1C68F3',
        '&:hover': {
            backgroundColor: '#dee0e1',
        },
    },
})

const SelectPersona = memo(() => {
    const { classes, cx } = useStyles()
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
                    className={cx(classes.button, classes.secondaryButton)}
                    disabled={!!(personas && personas.length >= MAX_PERSONA_LIMIT)}
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
