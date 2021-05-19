/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />
import ReactDOM from 'react-dom'

// @ts-ignore in case circle dependency make typescript complains
import { IntergratedDashboard } from '@dimensiondev/dashboard'
// @ts-ignore
import { setService, setPluginMessages, setMessages, setPluginServices } from '@dimensiondev/dashboard'
import Services from '../service'
import { WalletRPC, WalletMessages } from '../../plugins/Wallet/messages'
import { MaskMessage } from '../../utils/messages'
import { startPluginDashboard } from '@dimensiondev/mask-plugin-infra'
import { createPluginHost } from '../../plugin-infra/host'
setService(Services)
setMessages(MaskMessage)
setPluginServices({ Wallet: WalletRPC })
setPluginMessages({ Wallet: WalletMessages })
startPluginDashboard(createPluginHost())

const root = document.createElement('div')
document.body.insertBefore(root, document.body.children[0])
ReactDOM.unstable_createRoot(root).render(<IntergratedDashboard />)
