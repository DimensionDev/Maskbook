import * as Web3Accounts from /* webpackDefer: true */ 'web3-eth-accounts'

export function createAccount(): Web3Accounts.Web3Account {
    return Web3Accounts.create()
}
