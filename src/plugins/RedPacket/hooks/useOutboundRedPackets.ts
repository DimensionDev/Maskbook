import type { History, RedPacketJSONPayload } from '../types'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import { useChainId } from '../../../web3/hooks/useChainId'
import { useConstant } from '../../../web3/hooks/useConstant'
import { RED_PACKET_CONSTANTS, RED_PACKET_CONTRACT_VERSION, RED_PACKET_HISTROY_MAX_BLOCK_SIZE } from '../constants'
import { resolveChainName } from '../../../web3/pipes'
import { EthereumNetwork, EthereumTokenType } from '../../../web3/types'
import { useBlockNumber } from '../../../web3/hooks/useBlockNumber'

function getTransactionLog(name: History.Log['$name'], transactions: History.RedPacketRecord['transactions']) {
    const transaction = transactions.find((x) => x.records.find((y) => y.$name === name))
    return transaction?.records.find((y) => y.$name === name)
}

export function useOutboundRedPackets(from: string) {
    const chainId = useChainId()
    const blockNumber = useBlockNumber()
    const HAPPY_RED_PACKET_ADDRESS = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS')
    return useAsync(async () => {
        if (!blockNumber) return []

        const records = await Services.Plugin.invokePlugin(
            'maskbook.red_packet',
            'getOutboundRedPackets',
            chainId,
            from,
            blockNumber - RED_PACKET_HISTROY_MAX_BLOCK_SIZE,
        )
        const redPackets = records.map((x) => {
            const createLog = getTransactionLog('create_red_packet', x.transactions) as History.CreateInputLog
            const creationSuccessLog = getTransactionLog('CreationSuccess', x.transactions) as History.CreateOutputLog
            if (!createLog || !creationSuccessLog) return

            const tokenType = Number.parseInt(createLog._token_type) as EthereumTokenType
            const payload: RedPacketJSONPayload = {
                contract_address: HAPPY_RED_PACKET_ADDRESS,
                contract_version: RED_PACKET_CONTRACT_VERSION,
                rpid: x.id,
                password: '',
                shares: Number.parseInt(createLog._number),
                sender: {
                    address: creationSuccessLog.creator,
                    name: createLog._name,
                    message: createLog._message,
                },
                is_random: createLog._ifrandom,
                total: createLog._total_tokens,
                creation_time: Number.parseInt(creationSuccessLog?.creation_time),
                duration: Number.parseInt(createLog._duration),
                network: resolveChainName(chainId).toLowerCase() as EthereumNetwork,
                token_type: tokenType,
            }
            if (tokenType === EthereumTokenType.ERC20)
                payload.token = {
                    name: '',
                    symbol: '',
                    decimals: 0,
                    address: createLog._token_addr,
                }
            return payload
        })

        console.log('DEBUG: red packets')
        console.log(redPackets)

        return redPackets.filter(Boolean) as RedPacketJSONPayload[]
    }, [blockNumber, chainId, from])
}
