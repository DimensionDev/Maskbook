import React from 'react'
import { storiesOf } from '@storybook/react'
import { RedPacketWithState, RedPacket } from '../plugins/Wallet/UI/Dashboard/Components/RedPacket'
import { RedPacketRecord, EthereumNetwork, RedPacketStatus, RedPacketTokenType } from '../plugins/Wallet/database/types'
import { number, text, select } from '@storybook/addon-knobs'
import { Typography } from '@material-ui/core'

storiesOf('Plugin: Red Packets', module)
    .add('RedPacketWithState', () => (
        <>
            <RedPacketWithState />
        </>
    ))
    .add('RedPacket', () => {
        const shares = number('Shares', 1, { step: 1, min: 0 })
        const total = number('Total ETH', 5, { min: 0 })
        const claimedAmount = number('Claimed ETH', 1, { min: 0 }) * 1000000000000000000
        const message = text('Message', 'Happy New Year')
        // @ts-ignore
        const status = select('Status', RedPacketStatus)
        const opts = { shares, claimedAmount, message, status }
        const decimals = number('ERC20 Token decimal', 18, { min: 1, step: 1 })
        return (
            <>
                <Typography>ETH</Typography>
                <RedPacket
                    redPacket={createRecord({
                        ...opts,
                        total: total * 1000000000000000000,
                        type: RedPacketTokenType.eth,
                    })}
                />
                <hr />
                <Typography>ERC20</Typography>
                <RedPacket
                    redPacket={createRecord({
                        ...opts,
                        type: RedPacketTokenType.erc20,
                        total: total * 10 ** decimals,
                        token: {
                            address: 'addr',
                            name: text('ERC20 Token name', 'QwQ coin'),
                            decimals,
                            symbol: text('ERC20 Token symbol', 'TAT'),
                        },
                    })}
                />
            </>
        )
    })

function createRecord(opts: {
    shares: number
    total: number
    message: string
    status: RedPacketStatus
    claimedAmount: number
    type: RedPacketTokenType
    token?: NonNullable<RedPacketRecord['raw_payload']>['token']
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
        token_type: opts.type,
        _found_in_url_: 'https://g.cn/',
        claim_amount: BigInt(opts.claimedAmount),
        raw_payload: { token: opts.token } as any,
        erc20_token: opts.token ? 'aefwf' : undefined,
    }
    if (opts.total === 0) delete x.send_total
    if (opts.shares === 0) delete x.shares
    return x
}
