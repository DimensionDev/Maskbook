import { memo, useCallback, useEffect } from 'react'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'

import { Button, MenuItem, Typography } from '@mui/material'
import { useMenuConfig } from '@masknet/shared'
import { useSystemPreferencePalette } from '@masknet/theme'

export interface SettingsPageProps {}

export default function SettingsPage(props: SettingsPageProps) {
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Settings" />
                <div className="bg-white p-5">
                    <div className="border overflow-hidden rounded-lg">
                        <SetupThemeMode />
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}

const SetupThemeMode = memo(() => {
    const systemMode = useSystemPreferencePalette()

    const onClick = useCallback(
        (mode: 'dark' | 'light' | 'system') => {
            localStorage.themeMode = mode
        },
        [localStorage.themeMode],
    )

    useEffect(() => {
        if (!localStorage.themeMode || localStorage.themeMode === 'system') {
            if (systemMode === 'dark') document.documentElement.classList.add('dark')
            else document.documentElement.classList.add('light')
            return
        }
        if (localStorage.themeMode === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
    }, [systemMode, localStorage.themeMode])

    const [menu, openMenu] = useMenuConfig(
        [
            <MenuItem key="system" onClick={() => onClick('system')}>
                <Typography component="span">System</Typography>
            </MenuItem>,
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
            <Typography className="w-full text-black text-base">theme</Typography>
            <Button className="text-black bg-black/10  hover:bg-black/10 hover:text-black" onClick={openMenu}>
                {localStorage.themeMode === 'dark' ? 'Dark' : localStorage.themeMode === 'light' ? 'Light' : 'System'}
            </Button>
            {menu}
        </div>
    )
})
