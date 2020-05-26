import '../../social-network-provider/popup-page/index'
import '../../setup.ui'
import React, { useState } from 'react'

import { ThemeProvider, makeStyles, useTheme } from '@material-ui/core/styles'
import { Button, useMediaQuery, Paper, Divider, Typography } from '@material-ui/core'
import TuneIcon from '@material-ui/icons/Tune'
import { MaskbookLightTheme, MaskbookDarkTheme } from '../../utils/theme'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { appearanceSettings, Appearance } from '../../components/shared-settings/settings'
import { ChooseIdentity } from '../../components/shared/ChooseIdentity'
import { getActivatedUI } from '../../social-network/ui'
import { I18nextProvider } from 'react-i18next'
import { useI18N } from '../../utils/i18n-next-ui'
import i18nNextInstance from '../../utils/i18n-next'
import { useValueRef } from '../../utils/hooks/useValueRef'

const useStyles = makeStyles((theme) => ({
    container: {
        padding: '12px 20px',
        borderRadius: 0,
    },
    title: {
        fontSize: 20,
        fontWeight: 500,
        lineHeight: 1.5,
    },
    divider: {
        marginTop: 20,
        marginBottom: 20,
    },
    button: {
        whiteSpace: 'nowrap',
    },
}))

function Popup() {
    const { t } = useI18N()
    const classes = useStyles()

    const ui = getActivatedUI()
    const myIdentities = useValueRef(ui.myIdentitiesRef)

    return (
        <>
            <style>{`body {
                overflow-x: hidden;
                margin: 0 auto;
                width: 340px;
                max-width: 100%;
                background-color: transparent;
            }`}</style>
            <Paper className={classes.container}>
                <Typography className={classes.title}>Switch account</Typography>
                <ChooseIdentity />
                <Divider className={classes.divider} />
                <Button
                    className={classes.button}
                    variant="text"
                    color="primary"
                    startIcon={<TuneIcon />}
                    onClick={(e) => browser.runtime.openOptionsPage()}>
                    {t('popup_enter_dashboard')}
                </Button>
            </Paper>
        </>
    )
}

function PopupWithProvider() {
    const preferDarkScheme = useMediaQuery('(prefers-color-scheme: dark)')
    const appearance = useValueRef(appearanceSettings)
    return (
        <ThemeProvider
            theme={
                (preferDarkScheme && appearance === Appearance.default) || appearance === Appearance.dark
                    ? MaskbookDarkTheme
                    : MaskbookLightTheme
            }>
            <I18nextProvider i18n={i18nNextInstance}>
                <Popup />
            </I18nextProvider>
        </ThemeProvider>
    )
}

SSRRenderer(<PopupWithProvider />)
