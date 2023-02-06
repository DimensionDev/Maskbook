import type { NetworkPluginID } from '@masknet/shared-base'

export namespace LogHubBaseAPI {
    export enum Message {
        DashboardAccess = 'dashboard-access',
        ApplicationBoardAccess = 'application-board-access',
        PopupAccess = 'popup-access',
        PluginAccess = 'plugin-access',
        Web3ProfileDialogAccess = 'web3-profile-dialog-access',
    }

    export enum Platform {
        Background = 'background',
        Dashboard = 'dashboard',
        Popup = 'popup',
        Plugin = 'plugin',
    }

    export interface Logger {
        captureException(error: Error): void
        captureMessage(message: string): void
    }

    export interface Provider {
        createLogger(id: string, pluginID?: NetworkPluginID): Logger
    }
}
