import { useState } from 'react'
import type {
    DashboardRoutes,
    EnhanceableSite,
    PersonaInformation,
    PluginID,
    SingletonModalProps,
} from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { ApplicationBoard, ApplicationSettingTabs } from './ApplicationBoardDialog.js'
import type { PersonaPerSiteConnectStatus } from '../../../types.js'
import { ApplicationBoardSettingsDialog } from './ApplicationSettingsDialog.js'

export interface ApplicationBoardModalOpenProps {
    openDashboard: (route: DashboardRoutes, search?: string) => void
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>
    currentSite: EnhanceableSite
    allPersonas: PersonaInformation[]
    lastRecognized: IdentityResolved
    applicationCurrentStatus?: PersonaPerSiteConnectStatus
    personaPerSiteConnectStatusLoading: boolean
    setPluginMinimalModeEnabled: (id: string, checked: boolean) => Promise<void>

    quickMode?: boolean
    tab?: ApplicationSettingTabs
    focusPluginID?: PluginID
}

export function ApplicationBoardModal({ ref }: SingletonModalProps<ApplicationBoardModalOpenProps>) {
    const [openDashboard, setOpenDashboard] = useState<(route: DashboardRoutes, search?: string) => void>()
    const [queryOwnedPersonaInformation, setQueryOwnedPersonaInformation] =
        useState<(initializedOnly: boolean) => Promise<PersonaInformation[]>>()
    const [currentSite, setCurrentSite] = useState<EnhanceableSite>()
    const [allPersonas, setAllPersonas] = useState<PersonaInformation[]>()
    const [lastRecognized, setLastRecognized] = useState<IdentityResolved>()
    const [applicationCurrentStatus, setApplicationCurrentStatus] = useState<PersonaPerSiteConnectStatus>()
    const [personaPerSiteConnectStatusLoading, setPersonaPerSiteConnectStatusLoading] = useState(false)
    const [setPluginMinimalModeEnabled, setSetPluginMinimalModeEnabled] =
        useState<(id: string, checked: boolean) => Promise<void>>()
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
            onClose={() => dispatch?.close()}
            quickMode={quickMode}
            focusPluginID={focusPluginID}
            tab={tab}
        />
    )
}

export interface ApplicationBoardSettingsModalOpenProps {
    focusPluginID?: PluginID
    setPluginMinimalModeEnabled?: (id: string, checked: boolean) => Promise<void>
    tab?: ApplicationSettingTabs
}

export function ApplicationBoardSettingsModal({ ref }: SingletonModalProps<ApplicationBoardSettingsModalOpenProps>) {
    const [setPluginMinimalModeEnabled, setSetPluginMinimalModeEnabled] =
        useState<(id: string, checked: boolean) => Promise<void>>()
    const [focusPluginID, setFocusPluginID] = useState<PluginID>()
    const [tab, setTab] = useState<ApplicationSettingTabs | undefined>(ApplicationSettingTabs.pluginSwitch)
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setSetPluginMinimalModeEnabled(() => props.setPluginMinimalModeEnabled)
            setFocusPluginID(props.focusPluginID)
            setTab(props.tab)
        },
    })

    if (!open) return null
    return (
        <ApplicationBoardSettingsDialog
            open
            setPluginMinimalModeEnabled={setPluginMinimalModeEnabled}
            onClose={() => dispatch?.close()}
            focusPluginID={focusPluginID}
            tab={tab}
        />
    )
}
