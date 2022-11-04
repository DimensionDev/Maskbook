import type { Services as ServiceType } from '../../mask/background/services/types.js'
import type { MaskEvents } from '@masknet/shared-base'
import type { UnboundedRegistry, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { WalletMessages } from '@masknet/plugin-wallet'

export let Services: ServiceType = null!
export let Messages: WebExtensionMessage<MaskEvents> = null!
export let PluginServices: PluginServices = null!
export let PluginMessages: PluginMessages = null!
export interface PluginServices {
    Wallet: {
        createMnemonicWords(): Promise<string[]>
        hasPassword(): Promise<boolean>
        setPassword(newPassword: string): Promise<void>
        recoverWalletFromMnemonic(
            name: string,
            mnemonic: string,
            derivationPath?: string,
            initialPassword?: string | undefined,
        ): Promise<string>
        updateMaskAccount(options: { account?: string | undefined }): Promise<void>
        resolveMaskAccount(accounts: string[]): Promise<void>
        verifyPassword(unverifiedPassword: string): Promise<boolean>
    }
}
export interface PluginMessages {
    Wallet: Pick<typeof WalletMessages['events'], 'selectProviderDialogUpdated' | 'walletStatusDialogUpdated'>
    Transak: {
        buyTokenDialogUpdated: UnboundedRegistry<
            | {
                  open: true
                  code?: string
                  address: string
              }
            | { open: false }
        >
    }
}
export function setService(rpc: any) {
    Services = rpc
    Object.assign(globalThis, { Services: rpc })
}
export function setMessages(MaskMessage: any) {
    Messages = MaskMessage
    Object.assign(globalThis, { Messages: MaskMessage })
}
export function setPluginServices(rpc: PluginServices) {
    PluginServices = rpc
    Object.assign(globalThis, { PluginServices: rpc })
}
export function setPluginMessages(message: PluginMessages) {
    PluginMessages = message as any
    Object.assign(globalThis, { PluginMessages: message })
}
