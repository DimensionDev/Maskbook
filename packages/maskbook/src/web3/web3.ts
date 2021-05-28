import Web3 from 'web3'
import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import Services from '../extension/service'

// Learn more about external provider. Please check https://eips.ethereum.org/EIPS/eip-1193
export function createExternalProvider() {
    return {
        isMetaMask: false,
        isStatus: true,
        host: '',
        path: '',
        request: Services.Ethereum.request,
        send: Services.Ethereum.requestSend,
        sendAsync: Services.Ethereum.requestSend,
    }
}

assertEnvironment(Environment.HasBrowserAPI)

// This is a none-provider client for constructing & deconstructing transactions in the content and options page.
// @ts-ignore
export const nonFunctionalWeb3 = new Web3(createExternalProvider())
