import * as Web3Accounts from /* webpackDefer: true */ 'web3-eth-accounts'

export function signMessage(message: string, privateKey: string): Web3Accounts.SignResult {
    return Web3Accounts.sign(message, privateKey)
}
