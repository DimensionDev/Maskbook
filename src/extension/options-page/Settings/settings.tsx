import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import BugReport from '@material-ui/icons/BugReport'
import ImageMode from '@material-ui/icons/Image'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import LanguageIcon from '@material-ui/icons/Language'
import { Typography, Card, Divider } from '@material-ui/core'
import { SettingsUI, SettingsUIEnum } from '../../../components/shared-settings/useSettingsUI'
import {
    debugModeSetting,
    steganographyModeSetting,
    disableOpenNewTabInBackgroundSettings,
    languageSettings,
    Language,
} from '../../../components/shared-settings/settings'
import { useValueRef } from '../../../utils/hooks/useValueRef'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
    }),
)

export function Settings() {
    const [checked, setChecked] = React.useState(['wifi'])

    const currentLang = useValueRef(languageSettings)
    const langMapper = React.useRef((x: Language) => {
        if (x === Language.en) return 'English'
        if (x === Language.zh) return '中文'
        return ''
    }).current
    return (
        <>
            <Typography
                variant="subtitle2"
                style={{ marginTop: 21, marginBottom: 12, fontWeight: 300 }}
                color="textPrimary">
                General
            </Typography>
            <Card>
                <List dense>
                    <SettingsUI icon={<BugReport />} value={debugModeSetting} />
                    <Divider />
                    <SettingsUIEnum
                        secondary={langMapper(currentLang)}
                        enumObject={Language}
                        getText={langMapper}
                        icon={<LanguageIcon />}
                        value={languageSettings}
                    />
                </List>
            </Card>
            <Typography
                variant="subtitle2"
                style={{ marginTop: 21, marginBottom: 12, fontWeight: 300 }}
                color="textPrimary">
                Experimental Features
            </Typography>
            <Card>
                <List dense>
                    <SettingsUI icon={<ImageMode />} value={steganographyModeSetting} />
                </List>
            </Card>
            <Typography
                variant="subtitle2"
                style={{ marginTop: 21, marginBottom: 12, fontWeight: 300 }}
                color="textPrimary">
                Compatibility
            </Typography>
            <Card>
                <List dense>
                    <SettingsUI icon={<OpenInBrowser />} value={disableOpenNewTabInBackgroundSettings} />
                </List>
            </Card>
        </>
    )
}
