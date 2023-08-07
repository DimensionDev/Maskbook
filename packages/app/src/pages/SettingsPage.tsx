import { memo, useCallback, useEffect } from 'react'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'

import { Button, MenuItem, Typography } from '@mui/material'
import { spaThemeMode } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { useMenuConfig } from '@masknet/shared'

export interface SettingsPageProps {}

export default function SettingsPage(props: SettingsPageProps) {
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Settings" />
                <SetupThemeMode />
            </main>
        </DashboardContainer>
    )
}

const SetupThemeMode = memo(() => {
    const themeMode = useValueRef(spaThemeMode)
    const onClick = useCallback(
        (mode: 'dark' | 'light') => {
            spaThemeMode.value = mode
        },
        [spaThemeMode],
    )
    useEffect(() => {
        if (themeMode === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
    }, [themeMode])

    const [menu, openMenu] = useMenuConfig(
        [
            <MenuItem key="dark" onClick={() => onClick('dark')}>
                <Typography component="span">Dark</Typography>
            </MenuItem>,
            <MenuItem key="light" onClick={() => onClick('light')}>
                <Typography component="span">Light</Typography>
            </MenuItem>,
        ],
        {
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center',
            },
        },
    )

    return (
        <div className="flex w-full sm:p-6 justify-center sm:items-center">
            <Typography className="w-full text-gray-400">theme</Typography>
            <Button
                className="dark:text-white text-black bg-black/10 dark:bg-white/10 hover:text-white"
                onClick={openMenu}>
                {themeMode === 'dark' ? 'Dark' : 'Light'}
            </Button>
            {menu}
        </div>
    )
})
