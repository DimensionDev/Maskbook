import { getChainId } from '../../../extension/background-script/SettingsService'
import { getConstant } from '@dimensiondev/web3-shared'
import { tokenIntoMask } from '../../ITO/helpers'
import { RED_PACKET_CONSTANTS } from '../constants'
import type { RedPacketHistoryOutMask, RedPacketHistoryInMask } from '../types'

const TOKEN_FIELDS = `
    type
    address
    name
    symbol
    decimals
    chain_id
`

const USER_FIELDS = `
    address
    name
`

const RED_PACKET_FIELDS = `
    rpid
    contract_address
    password
    shares
    message
    name
    is_random
    total
    total_remaining
    creation_time
    last_updated_time
    duration
    chain_id
    token {
        ${TOKEN_FIELDS}
    }
    creator {
        ${USER_FIELDS}
    }
    claimers {
        ${USER_FIELDS}
    }
`
export async function getAllRedPackets(address: string) {
    const response = await fetch(getConstant(RED_PACKET_CONSTANTS, 'SUBGRAPH_URL', await getChainId()), {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                redPackets (where: { creator: "${address.toLowerCase()}" }) {
                    ${RED_PACKET_FIELDS}
                }
            }
            `,
        }),
    })

    const {
        data: { redPackets },
    } = (await response.json()) as { data: { redPackets: RedPacketHistoryOutMask[] } }

    console.log(redPackets, 'redPackets')

    return redPackets
        .map((x) => ({ ...x, token: tokenIntoMask(x.token) } as RedPacketHistoryInMask))
        .sort((a, b) => b.creation_time - a.creation_time)
}
