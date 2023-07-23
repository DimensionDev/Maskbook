import { forwardRef, useState } from 'react'
import type { DashboardRoutes, PersonaInformation, PluginID, SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { CurrentSNSNetwork, IdentityResolved } from '@masknet/plugin-infra'
import { ApplicationBoard, ApplicationSettingTabs } from './ApplicationBoardDialog.js'
import type { PersonaAgainstSNSConnectStatus } from '../../../types.js'

export type ApplicationBoardModalOpenProps = {
    openDashboard: (route?: DashboardRoutes, search?: string) => void
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>
    currentSNSNetwork: CurrentSNSNetwork
    allPersonas: PersonaInformation[]
    lastRecognized: IdentityResolved
    applicationCurrentStatus?: PersonaAgainstSNSConnectStatus
    personaAgainstSNSConnectStatusLoading: boolean
    setPluginMinimalModeEnabled: (id: string, checked: boolean) => Promise<void>
    getDecentralizedSearchSettings: () => Promise<boolean>
    setDecentralizedSearchSettings: (checked: boolean) => Promise<void>

    quickMode?: boolean
    tab?: ApplicationSettingTabs
    focusPluginID?: PluginID
}

export interface ApplicationBoardModalProps {}

export const ApplicationBoardModal = forwardRef<
    SingletonModalRefCreator<ApplicationBoardModalOpenProps>,
    ApplicationBoardModalProps
>((props, ref) => {
    const [openDashboard, setOpenDashboard] = useState<(route?: DashboardRoutes, search?: string) => void>()
    const [queryOwnedPersonaInformation, setQueryOwnedPersonaInformation] =
        useState<(initializedOnly: boolean) => Promise<PersonaInformation[]>>()
    const [currentSNSNetwork, setCurrentSNSNetwork] = useState<CurrentSNSNetwork>()
    const [allPersonas, setAllPersonas] = useState<PersonaInformation[]>()
    const [lastRecognized, setLastRecognized] = useState<IdentityResolved>()
    const [applicationCurrentStatus, setApplicationCurrentStatus] = useState<PersonaAgainstSNSConnectStatus>()
    const [personaAgainstSNSConnectStatusLoading, setPersonaAgainstSNSConnectStatusLoading] = useState(false)
    const [setPluginMinimalModeEnabled, setSetPluginMinimalModeEnabled] =
        useState<(id: string, checked: boolean) => Promise<void>>()
    const [getDecentralizedSearchSettings, setGetDecentralizedSearchSettings] = useState<() => Promise<boolean>>()
    const [setDecentralizedSearchSettings, setSetDecentralizedSearchSettings] =
        useState<(checked: boolean) => Promise<void>>()
    const [quickMode, setQuickMode] = useState(false)
    const [tab, setTab] = useState<ApplicationSettingTabs>()
    const [focusPluginID, setFocusPluginID] = useState<PluginID>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setOpenDashboard(() => props.openDashboard)
            setQueryOwnedPersonaInformation(() => props.queryOwnedPersonaInformation)
            setCurrentSNSNetwork(props.currentSNSNetwork)
            setAllPersonas(props.allPersonas)
            setLastRecognized(props.lastRecognized)
            setApplicationCurrentStatus(props.applicationCurrentStatus)
            setPersonaAgainstSNSConnectStatusLoading(props.personaAgainstSNSConnectStatusLoading)
            setSetPluginMinimalModeEnabled(() => props.setPluginMinimalModeEnabled)
            setGetDecentralizedSearchSettings(() => props.getDecentralizedSearchSettings)
            setSetDecentralizedSearchSettings(() => props.setDecentralizedSearchSettings)
            setQuickMode(props.quickMode ?? false)
            setTab(props.tab ?? ApplicationSettingTabs.pluginSwitch)
            setFocusPluginID(props.focusPluginID)
        },
    })

    if (!open) return null
    return (
        <ApplicationBoard
            open
            allPersonas={allPersonas ?? []}
            lastRecognized={lastRecognized}
            currentSNSNetwork={currentSNSNetwork}
            applicationCurrentStatus={applicationCurrentStatus}
            queryOwnedPersonaInformation={queryOwnedPersonaInformation}
            personaAgainstSNSConnectStatusLoading={personaAgainstSNSConnectStatusLoading}
            openDashboard={openDashboard}
            setPluginMinimalModeEnabled={setPluginMinimalModeEnabled}
            getDecentralizedSearchSettings={getDecentralizedSearchSettings}
            setDecentralizedSearchSettings={setDecentralizedSearchSettings}
            onClose={() => dispatch?.close()}
            quickMode={quickMode}
            focusPluginID={focusPluginID}
            tab={tab}
        />
    )
})
