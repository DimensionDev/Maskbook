import { memo } from 'react'
import { DropdownMenu } from '../components/DropdownMenu.js'
import { DashboardBody } from '../components/DashboardBody.js'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'

import { Typography } from '@mui/material'
import { Appearance } from '@masknet/public-api'
import { MaskMessages } from '@masknet/shared-base'
import { useSetThemeMode } from '../hooks/useSetThemeMode.js'
import { useThemeMode } from '../hooks/useThemeMode.js'

export interface SettingsPageProps {}

export default function SettingsPage(props: SettingsPageProps) {
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Settings" />
                <DashboardBody clipEdge={false}>
                    <SetupThemeMode />
                </DashboardBody>
            </main>
        </DashboardContainer>
    )
}

const SetupThemeMode = memo(() => {
    const setThemeMode = useSetThemeMode()
    const mode = useThemeMode()

    return (
        <div className="flex w-full sm:p-6 justify-center sm:items-center">
            <Typography className="w-full text-black dark:text-white text-base flex items-center px-3">
                Appearance
            </Typography>
            <DropdownMenu
                activeItemId={mode}
                items={[
                    {
                        id: Appearance.default,
                        label: 'Follow System',
                    },
                    {
                        id: Appearance.light,
                        label: 'Light',
                    },
                    {
                        id: Appearance.dark,
                        label: 'Dark',
                    },
                ]}
                onItemChange={(item) => {
                    const appearance = item.id as Appearance

                    setThemeMode(appearance)
                    MaskMessages.events.appearanceSettings.sendToLocal(appearance)
                }}
            />
        </div>
    )
})
