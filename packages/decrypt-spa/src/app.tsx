import Decrypt from './decrypt/index.js'
import '@masknet/plugin-wallet'
import '@masknet/plugin-evm'
import '@masknet/plugin-gitcoin'
import './plugin-host/index.js'

export function App() {
    return <Decrypt />
}
