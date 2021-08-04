import type {} from 'react/next'
import type {} from 'react-dom/next'
import ReactDOM from 'react-dom'

// @ts-ignore in case circle dependency make typescript complains
import { setService, setPluginMessages, setMessages, setPluginServices, IntergratedDashboard } from '@masknet/dashboard'
import Services from '../service'
import { WalletRPC, WalletMessages } from '../../plugins/Wallet/messages'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { PluginTraderMessages, PluginTraderRPC } from '../../plugins/Trader/messages'
import { MaskMessage } from '../../utils/messages'
import { startPluginDashboard } from '@masknet/plugin-infra'
import { createPluginHost } from '../../plugin-infra/host'
import type { DashboardPluginMessages, DashboardPluginServices } from '@masknet/shared'

const msg: DashboardPluginMessages = {
    Wallet: WalletMessages,
    Swap: PluginTraderMessages,
    Transak: PluginTransakMessages,
}
const rpc: DashboardPluginServices = {
    Wallet: WalletRPC,
    Swap: PluginTraderRPC,
}
// @ts-ignore To avoid build failure due to the circular project reference
setService(Services)
// @ts-ignore
setMessages(MaskMessage)
// @ts-ignore
setPluginServices(rpc)
// @ts-ignore
setPluginMessages(msg)
startPluginDashboard(createPluginHost())

const root = document.createElement('div')
document.body.insertBefore(root, document.body.children[0])
ReactDOM.createRoot(root).render(<IntergratedDashboard />)
