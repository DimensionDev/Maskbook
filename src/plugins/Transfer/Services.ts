import { walletAPI, erc20API } from '../Wallet/api'
import { TransferPayload, EthereumTokenType } from '../Wallet/database/types'

export * from './address'

export function transfer(payload: TransferPayload) {
    const { token, token_type, owner_address, recipient_address, transfer_total } = payload
    if (token_type === EthereumTokenType.ETH)
        return walletAPI.transfer(owner_address, recipient_address, transfer_total)
    else if (token_type === EthereumTokenType.ERC20 && token?.address)
        return erc20API.transfer(owner_address, recipient_address, token?.address, transfer_total)
    throw new Error(`unknown token ${token_type}`)
}
