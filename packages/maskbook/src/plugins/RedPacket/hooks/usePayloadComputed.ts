import { useChainId } from '../../../web3/hooks/useChainId'
import { resolveChainName } from '../../../web3/pipes'
import { ChainId, EthereumNetwork, EthereumTokenType } from '../../../web3/types'
import { RED_PACKET_CONSTANTS, RED_PACKET_CONTRACT_VERSION } from '../constants'
import type { History, RedPacketJSONPayload } from '../types'
import { useRedPacketsFromDB } from './useRedPacket'

function getTransactionLog(name: History.Log['$name'], transactions: History.RedPacketRecord['transactions']) {
    const transaction = transactions.find((x) => x.records.find((y) => y.$name === name))
    return transaction?.records.find((y) => y.$name === name)
}

function getPayload(chainId: ChainId, record: History.RedPacketRecord, overrides?: Partial<RedPacketJSONPayload>) {
    const createLog = getTransactionLog('create_red_packet', record.transactions) as History.CreateInputLog
    const CreationSuccessLog = getTransactionLog('CreationSuccess', record.transactions) as History.CreateOutputLog
    const tokenType = Number.parseInt(createLog._token_type, 10) as EthereumTokenType.Native | EthereumTokenType.ERC20
    const payload: RedPacketJSONPayload = {
        contract_address: RED_PACKET_CONSTANTS.HAPPY_RED_PACKET_ADDRESS[chainId],
        contract_version: RED_PACKET_CONTRACT_VERSION,
        rpid: CreationSuccessLog.id,
        password: '',
        shares: Number.parseInt(createLog._number, 10),
        sender: {
            address: CreationSuccessLog.creator,
            name: createLog._name,
            message: createLog._message,
        },
        is_random: createLog._ifrandom,
        total: createLog._total_tokens,
        creation_time: Number.parseInt(CreationSuccessLog?.creation_time, 10) * 1000,
        duration: Number.parseInt(createLog._duration, 10),
        network: resolveChainName(chainId) as EthereumNetwork,
        token_type: tokenType,
        ...overrides,
    }

    // TODO:
    // fetch token info with multicall
    if (tokenType === EthereumTokenType.ERC20)
        payload.token = {
            name: '',
            symbol: '',
            decimals: 0,
            address: createLog._token_addr,
        }
    return payload
}

/**
 * Filter records by given type
 * @param type
 * @param records
 */
export function usePayloadsComputed(type: 'create' | 'claim' | 'refund', records: History.RedPacketRecord[]) {
    const chainId = useChainId()
    const chainRecords = records.filter((x) => {
        if (type === 'create') {
            const createLog = getTransactionLog('create_red_packet', x.transactions) as History.CreateInputLog
            const CreationSuccessLog = getTransactionLog('CreationSuccess', x.transactions) as History.CreateOutputLog
            if (!createLog || !CreationSuccessLog) return false
        }
        if (type === 'claim') {
            const claimLog = getTransactionLog('claim', x.transactions) as History.ClaimInputLog
            const ClaimSuccessLog = getTransactionLog('ClaimSuccess', x.transactions) as History.ClaimOutputLog
            if (!claimLog || !ClaimSuccessLog) return false
        }
        if (type === 'refund') {
            const refundLog = getTransactionLog('refund', x.transactions) as History.RefundInputLog
            const RefundSuccessLog = getTransactionLog('RefundSuccess', x.transactions) as History.RefundOutputLog
            if (!refundLog || !RefundSuccessLog) return false
        }
        return true
    })
    const dbRecords = useRedPacketsFromDB()

    // for created and refunded red packets fetch them from the chain
    if (type === 'create' || type === 'refund')
        return chainRecords
            .map((x) => getPayload(chainId, x))
            .map((x) => {
                // but prefer the record from the DB because there is no token info stored on the chain
                const dbRecord = dbRecords.find((y) => x.rpid === y.id)?.payload
                return dbRecord ?? x
            })
            .sort((a, z) => z.creation_time - a.creation_time)

    // for claimed red packets must be found in the DB
    // because it's too hard to fetch the red packet info which created by others
    const lookUpSet = new Set(chainRecords.map((x) => x.id))
    return dbRecords
        .filter((x) => lookUpSet.has(x.id))
        .map((y) => y.payload)
        .sort((a, z) => z.creation_time - a.creation_time)
}
