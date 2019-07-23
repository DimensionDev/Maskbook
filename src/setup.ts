import './social-network-provider/facebook.com/worker'
export function backgroundSetup() {
    Object.assign(window, {
        elliptic: require('elliptic'),
    })
}
export function uiSetup() {}
