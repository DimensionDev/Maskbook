import { memo, useCallback, useState } from 'react'
import { DashboardBody } from '../components/DashboardBody.js'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'

import { Button, MenuItem, Typography } from '@mui/material'
import { useMenuConfig } from '@masknet/shared'
import { getThemeMode, useSaveThemeMode, useSetThemeMode } from '../helpers/setThemeMode.js'
import { Appearance } from '@masknet/public-api'
import { MaskMessages } from '@masknet/shared-base'

export interface SettingsPageProps {}

export default function SettingsPage(props: SettingsPageProps) {
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Settings" />

                <DashboardBody>
                    <SetupThemeMode />
                </DashboardBody>
            </main>
        </DashboardContainer>
    )
}

const SetupThemeMode = memo(() => {
    const setThemeMode = useSetThemeMode()
    const saveThemeMode = useSaveThemeMode()
    const [mode, setMode] = useState<Appearance>(getThemeMode())

    const onClick = useCallback(
        (mode: Appearance) => {
            MaskMessages.events.appearanceSettings.sendToLocal(mode)
            setThemeMode(mode)
            saveThemeMode(mode)
            setMode(mode)
        },
        [localStorage.themeMode, setThemeMode, saveThemeMode],
    )

    const [menu, openMenu] = useMenuConfig(
        [
            <MenuItem key={Appearance.default} onClick={() => onClick(Appearance.default)}>
                <Typography component="span">System</Typography>
            </MenuItem>,
            <MenuItem key={Appearance.dark} onClick={() => onClick(Appearance.dark)}>
                <Typography component="span">Dark</Typography>
            </MenuItem>,
            <MenuItem key={Appearance.light} onClick={() => onClick(Appearance.light)}>
                <Typography component="span">Light</Typography>
            </MenuItem>,
        ],
        {
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center',
            },
            classes: {},
        },
    )

    return (
        <div className="flex w-full sm:p-6 justify-center sm:items-center">
            <Typography className="w-full text-black dark:text-white text-base">Theme</Typography>
            <Button
                className="bg-button-light  text-black dark:bg-button-dark dark:text-white hover:bg-button-light dark:hover:bg-button-dark"
                onClick={openMenu}>
                {mode === Appearance.dark ? 'Dark' : mode === Appearance.light ? 'Light' : 'System'}
            </Button>
            {menu}
        </div>
    )
})
