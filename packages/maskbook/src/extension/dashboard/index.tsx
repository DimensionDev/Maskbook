import type {} from 'react/next'
import type {} from 'react-dom/next'
import ReactDOM from 'react-dom'

// @ts-ignore in case circle dependency make typescript complains
import { IntergratedDashboard } from '@masknet/dashboard'
// @ts-ignore
import { setService, setPluginMessages, setMessages, setPluginServices } from '@masknet/dashboard'
import Services from '../service'
import { WalletRPC, WalletMessages } from '../../plugins/Wallet/messages'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { PluginTraderMessages, PluginTraderRPC } from '../../plugins/Trader/messages'
import { MaskMessage } from '../../utils/messages'
import { startPluginDashboard } from '@masknet/plugin-infra'
import { createPluginHost } from '../../plugin-infra/host'
setService(Services)
setMessages(MaskMessage)
setPluginServices({ Wallet: WalletRPC, Swap: PluginTraderRPC })
setPluginMessages({ Wallet: WalletMessages, Transak: PluginTransakMessages, Swap: PluginTraderMessages })
startPluginDashboard(createPluginHost())

const root = document.createElement('div')
document.body.insertBefore(root, document.body.children[0])
ReactDOM.createRoot(root).render(<IntergratedDashboard />)
