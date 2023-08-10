import { forwardRef, useState } from 'react'
import type { DashboardRoutes, PersonaInformation, PluginID, SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { SiteAdaptor, IdentityResolved } from '@masknet/plugin-infra'
import { ApplicationBoard, ApplicationSettingTabs } from './ApplicationBoardDialog.js'
import type { PersonaPerSiteConnectStatus } from '../../../types.js'
import { ApplicationBoardSettingsDialog } from './ApplicationSettingsDialog.js'

export interface ApplicationBoardModalOpenProps {
    openDashboard: (route?: DashboardRoutes, search?: string) => void
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>
    currentSite: SiteAdaptor
    allPersonas: PersonaInformation[]
    lastRecognized: IdentityResolved
    applicationCurrentStatus?: PersonaPerSiteConnectStatus
    personaPerSiteConnectStatusLoading: boolean
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
    const [currentSite, setCurrentSite] = useState<SiteAdaptor>()
    const [allPersonas, setAllPersonas] = useState<PersonaInformation[]>()
    const [lastRecognized, setLastRecognized] = useState<IdentityResolved>()
    const [applicationCurrentStatus, setApplicationCurrentStatus] = useState<PersonaPerSiteConnectStatus>()
    const [personaPerSiteConnectStatusLoading, setPersonaPerSiteConnectStatusLoading] = useState(false)
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
            setCurrentSite(props.currentSite)
            setAllPersonas(props.allPersonas)
            setLastRecognized(props.lastRecognized)
            setApplicationCurrentStatus(props.applicationCurrentStatus)
            setPersonaPerSiteConnectStatusLoading(props.personaPerSiteConnectStatusLoading)
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
            currentSite={currentSite}
            applicationCurrentStatus={applicationCurrentStatus}
            queryOwnedPersonaInformation={queryOwnedPersonaInformation}
            personaPerSiteConnectStatusLoading={personaPerSiteConnectStatusLoading}
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

export interface ApplicationBoardSettingsModalOpenProps {
    focusPluginID?: PluginID
    setPluginMinimalModeEnabled?: (id: string, checked: boolean) => Promise<void>
    getDecentralizedSearchSettings?: () => Promise<boolean>
    setDecentralizedSearchSettings?: (checked: boolean) => Promise<void>
    tab?: ApplicationSettingTabs
}

export type ApplicationBoardSettingsModalProps = {}

export const ApplicationBoardSettingsModal = forwardRef<
    SingletonModalRefCreator<ApplicationBoardSettingsModalOpenProps>,
    ApplicationBoardSettingsModalProps
>((props, ref) => {
    const [setPluginMinimalModeEnabled, setSetPluginMinimalModeEnabled] =
        useState<(id: string, checked: boolean) => Promise<void>>()
    const [getDecentralizedSearchSettings, setGetDecentralizedSearchSettings] = useState<() => Promise<boolean>>()
    const [setDecentralizedSearchSettings, setSetDecentralizedSearchSettings] =
        useState<(checked: boolean) => Promise<void>>()
    const [focusPluginID, setFocusPluginID] = useState<PluginID>()
    const [tab, setTab] = useState<ApplicationSettingTabs | undefined>(ApplicationSettingTabs.pluginSwitch)
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setSetPluginMinimalModeEnabled(() => props.setPluginMinimalModeEnabled)
            setGetDecentralizedSearchSettings(() => props.getDecentralizedSearchSettings)
            setSetDecentralizedSearchSettings(() => props.setDecentralizedSearchSettings)
            setFocusPluginID(props.focusPluginID)
            setTab(props.tab)
        },
    })

    if (!open) return null
    return (
        <ApplicationBoardSettingsDialog
            open
            setPluginMinimalModeEnabled={setPluginMinimalModeEnabled}
            getDecentralizedSearchSettings={getDecentralizedSearchSettings}
            setDecentralizedSearchSettings={setDecentralizedSearchSettings}
            onClose={() => dispatch?.close()}
            focusPluginID={focusPluginID}
            tab={tab}
        />
    )
})
