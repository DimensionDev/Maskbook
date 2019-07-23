import FacebookWorker from './social-network-provider/facebook.com/worker'
export function backgroundSetup() {
    Object.assign(window, {
        elliptic: require('elliptic'),
    })
    FacebookWorker()
}
export function uiSetup() {}
