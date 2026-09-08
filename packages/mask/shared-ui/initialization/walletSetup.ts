import Services from '#services'
import { initWallet } from '@masknet/web3-providers'
import {
    CrossIsolationMessages,
    NetworkPluginID,
    PopupModalRoutes,
    Sniffings,
    getSiteType,
    pluginIDsSettings,
} from '@masknet/shared-base'
import defer * as shared from '@masknet/shared'
import { delay } from '@masknet/kit'
import { openPopupWindow } from '../utils/openPopup.js'

// The background opens the connect-wallet onboarding popup with the modal
// route percent-encoded in the query ("…?from=%2Fselect-provider"), and
// in-popup modal navigation encodes the "modal" search param the same way,
// so decode the query before matching instead of reading location.hash raw.
function requestsConnectProviderModal() {
    const query = location.hash.slice(Math.max(location.hash.indexOf('?'), 0))
    const params = new URLSearchParams(query)
    return [params.get('from'), params.get('modal')].some(
        (param) =>
            param?.includes(PopupModalRoutes.SelectProvider) || param?.includes(PopupModalRoutes.ConnectProvider),
    )
}

await pluginIDsSettings.readyPromise
// The root web3 context provider renders the plugin persisted for this site,
// so a non-EVM plugin means the Solana/Flow state is read before the first
// paint and must not be deferred past it.
const site = getSiteType()
const persistedNonEVMPlugin = site ? pluginIDsSettings.value[site] !== NetworkPluginID.PLUGIN_EVM : false

const { initialStateReady, allStatesReady } = initWallet(
    {
        WalletConnectContext: {
            openWalletConnectDialog: async (uri: string) => {
                if (Sniffings.is_popup_page) {
                    const { promise, resolve, reject } = Promise.withResolvers<boolean>()
                    const callback = ({ open }: { open: boolean }) => (open ? undefined : resolve(true))

                    delay(5000).then(() => reject(new Error('timeout')))
                    CrossIsolationMessages.events.popupWalletConnectEvent.on(callback)
                    CrossIsolationMessages.events.popupWalletConnectEvent.sendToAll({ uri, open: true })

                    await promise.finally(() => CrossIsolationMessages.events.popupWalletConnectEvent.off(callback))
                } else {
                    await shared.WalletConnectQRCodeModal.openAndWaitForClose({
                        uri,
                    })
                }
            },
            closeWalletConnectDialog: () => {
                if (Sniffings.is_popup_page) {
                    CrossIsolationMessages.events.popupWalletConnectEvent.sendToAll({ open: false })
                    return
                }
                shared.WalletConnectQRCodeModal.close()
            },
        },
        MessageContext: {
            openPopupWindow,
            send: Services.Wallet.send,
        },
    },
    {
        deferNonEVM: Sniffings.is_popup_page && !persistedNonEVMPlugin && !requestsConnectProviderModal(),
    },
)

export { allStatesReady }
// Settles even when a wallet state fails to initialize, so the modal gate in
// popups can suspend on it without rethrowing the rejection during render.
const allStatesReadySettled = allStatesReady.catch(() => {})
export { allStatesReadySettled }
void allStatesReady.catch((error: unknown) => console.error('Failed to initialize all wallet states.', error))
await initialStateReady
