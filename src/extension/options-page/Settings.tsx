import React from 'react'
import { makeStyles, List, Container } from '@material-ui/core'
import {
    debugModeSetting,
    steganographyModeSetting,
    disableOpenNewTabInBackgroundSettings,
    languageSettings,
    Language,
} from '../../components/shared-settings/settings'
import { SettingsUI, SettingUIGroup } from '../../components/shared-settings/useSettingsUI'
import { currentEthereumNetworkSettings } from '../../plugins/Wallet/network'
import { EthereumNetwork } from '../../plugins/Wallet/database/types'
import { geti18nString } from '../../utils/i18n'

function DashboardSettingsPage() {
    return (
        <Container maxWidth="md">
            <SettingUIGroup title={geti18nString('miscellaneous')}>
                <SettingsUI value={languageSettings} mode={{ enum: Language, type: 'enum' }} />
                <SettingsUI value={debugModeSetting} />
                <SettingsUI value={steganographyModeSetting} />
                <SettingsUI value={disableOpenNewTabInBackgroundSettings} />
                <SettingsUI value={currentEthereumNetworkSettings} mode={{ type: 'enum', enum: EthereumNetwork }} />
            </SettingUIGroup>
        </Container>
    )
}

export default DashboardSettingsPage
