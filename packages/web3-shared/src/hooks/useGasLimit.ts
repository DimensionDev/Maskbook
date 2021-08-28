import { EthereumTokenType } from '../types'
import { useERC20TokenContract } from '../contracts'
import { useAccount, useWeb3 } from '.'
import { useAsync } from 'react-use'

export function useGasLimit(type: EthereumTokenType, address: string, amount: string, recipient: string) {
    const web3 = useWeb3()
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)

    return useAsync(async () => {
        if ((type = EthereumTokenType.Native))
            return web3.eth.estimateGas({
                from: account,
                to: recipient,
                value: amount,
            })

        if ((type = EthereumTokenType.ERC20)) {
            return erc20Contract?.methods.transfer(recipient, amount).estimateGas({
                from: account,
            })
        }

        return 0
    }, [erc20Contract, type, amount, account, recipient])
}
