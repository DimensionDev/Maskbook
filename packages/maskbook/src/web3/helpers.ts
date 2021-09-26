import Services from '../extension/service'

export function createExternalProvider(disablePopup = false) {
    return {
        isMetaMask: false,
        isMask: true,
        isStatus: true,
        host: '',
        path: '',
        sendAsync: disablePopup ? Services.Ethereum.requestSendWithoutPopup : Services.Ethereum.requestSend,
        send: disablePopup ? Services.Ethereum.requestSendWithoutPopup : Services.Ethereum.requestSend,
        request: disablePopup ? Services.Ethereum.requestWithoutPopup : Services.Ethereum.request,
    }
}
