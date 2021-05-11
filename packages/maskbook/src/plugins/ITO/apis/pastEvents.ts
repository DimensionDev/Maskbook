import type { AbiItem } from 'web3-utils'
import ITO_ABI from '@dimensiondev/contracts/abis/ITO.json'
import { getConstant } from '../../../web3/helpers'
import { ITO_CONSTANTS } from '../constants'
import * as Maskbook from '../../../extension/background-script/EthereumServices/providers/Maskbook'

export async function getPool(pid: string) {
    const web3 = await Maskbook.createWeb3()
    const ITO_CONTRACT_ADDRESS = getConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const ITO_Contract = new web3.eth.Contract(ITO_ABI as AbiItem[], ITO_CONTRACT_ADDRESS)

    if (!ITO_Contract) throw new Error('unable to create contract instance.')

    const eventData = await ITO_Contract.getPastEvents('FillSuccess', {
        filter: {
            id: pid,
        },
        fromBlock: 0,
        toBlock: 'latest',
    })

    console.log(eventData)
}
