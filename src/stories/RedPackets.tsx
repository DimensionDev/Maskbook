import React from 'react'
import { storiesOf } from '@storybook/react'
import { RedPacketWithState, RedPacket } from '../plugins/Wallet/UI/Dashboard/Components/RedPacket'
import { RedPacketRecord, EthereumNetwork, RedPacketStatus, RedPacketTokenType } from '../plugins/Wallet/database/types'
import { number, text, select } from '@storybook/addon-knobs'

storiesOf('Plugin: Red Packets', module)
    .add('RedPacketWithState', () => (
        <>
            <RedPacketWithState />
        </>
    ))
    .add('RedPacket', () => (
        <>
            <RedPacket
                redPacket={createRecord({
                    shares: number('Shares', 1, { step: 1, min: 0 }),
                    total: number('Total ETH', 5, { min: 0 }) * 1000000000000000000,
                    claimedAmount: number('Claimed ETH', 1, { min: 0 }) * 1000000000000000000,
                    message: text('Message', 'Happy New Year'),
                    // @ts-ignore
                    status: select('Status', RedPacketStatus),
                })}
            />
        </>
    ))

function createRecord(opts: {
    shares: number
    total: number
    message: string
    status: RedPacketStatus
    claimedAmount: number
}): RedPacketRecord {
    const x: RedPacketRecord = {
        _data_source_: 'mock',
        aes_version: 1,
        contract_address: 'contract_address',
        contract_version: 1,
        duration: 86400,
        id: 'id',
        is_random: false,
        network: EthereumNetwork.Rinkeby,
        password: 'password',
        received_time: new Date(),
        send_message: opts.message,
        send_total: BigInt(opts.total),
        sender_address: 'sender_address',
        sender_name: 'Sender name',
        shares: BigInt(opts.shares),
        status: opts.status,
        token_type: RedPacketTokenType.eth,
        _found_in_url_: 'https://g.cn/',
        claim_amount: BigInt(opts.claimedAmount),
    }
    if (opts.total === 0) delete x.send_total
    if (opts.shares === 0) delete x.shares
    return x
}
