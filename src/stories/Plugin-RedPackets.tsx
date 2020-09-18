import React from 'react'
import { storiesOf } from '@storybook/react'
import { RedPacketWithStateUI, RedPacket } from '../plugins/RedPacket/UI/RedPacket'
import { EthereumNetwork, EthereumTokenType } from '../plugins/Wallet/database/types'
import { RedPacketRecord, RedPacketStatus, RedPacketJSONPayload } from '../plugins/RedPacket/types'
import { number, text, select, boolean } from '@storybook/addon-knobs'
import { Typography, Paper } from '@material-ui/core'
import { action } from '@storybook/addon-actions'
import BigNumber from 'bignumber.js'
import { makeTypedMessageText } from '../protocols/typed-message'
import { DAI_ADDRESS } from '../plugins/Wallet/token'
import { DecryptPostSuccess } from '../components/InjectedComponents/DecryptedPost/DecryptedPostSuccess'
import { RedPacketMetaKey } from '../plugins/RedPacket/constants'

storiesOf('Plugin: Red Packets', module)
    .add('RedPacketWithStateUI', () => {
        const { decimals, erc20name, erc20symbol, total, ...opts } = createRedPacketKnobs()
        const loading = boolean('Loading', false)
        const eth = createRecord({
            ...opts,
            total: total * 1000000000000000000,
            type: EthereumTokenType.ETH,
            status: RedPacketStatus.incoming,
        })
        const erc20 = createRecord({
            ...opts,
            type: EthereumTokenType.ERC20,
            total: total * 10 ** decimals,
            token: {
                address: 'addr',
                name: erc20name,
                decimals,
                symbol: erc20symbol,
            },
            status: RedPacketStatus.claimed,
        })
        const dai = createRecord({
            ...opts,
            type: EthereumTokenType.ERC20,
            total: total * 10 ** decimals,
            token: {
                address: DAI_ADDRESS,
                name: 'DAI',
                decimals,
                symbol: erc20symbol,
            },
            status: RedPacketStatus.empty,
        })
        return (
            <>
                <Typography>ETH</Typography>
                <RedPacketWithStateUI redPacket={eth} loading={loading} onClick={action('onClick')} />
                <hr />
                <Typography>ERC20</Typography>
                <RedPacketWithStateUI onClick={action('onClick')} loading={loading} redPacket={erc20} />
                <hr />
                <Typography>DAI</Typography>
                <RedPacketWithStateUI onClick={action('onClick')} loading={loading} redPacket={dai} />
            </>
        )
    })
    .add('RedPacket', () => {
        const { decimals, erc20name, erc20symbol, total, ...opts } = createRedPacketKnobs()
        return (
            <>
                <Typography>ETH</Typography>
                <RedPacket
                    redPacket={createRecord({
                        ...opts,
                        total: total * 1000000000000000000,
                        type: EthereumTokenType.ETH,
                    })}
                />
                <hr />
                <Typography>ERC20</Typography>
                <RedPacket
                    redPacket={createRecord({
                        ...opts,
                        type: EthereumTokenType.ERC20,
                        total: total * 10 ** decimals,
                        token: {
                            address: 'addr',
                            name: erc20name,
                            decimals,
                            symbol: erc20symbol,
                        },
                    })}
                />
            </>
        )
    })
    .add('Decrypted post with Red Packet', () => {
        const knobs = createRedPacketKnobs()
        // @ts-ignore
        const payload: RedPacketJSONPayload = {
            ...createRecord({ ...knobs, type: EthereumTokenType.ETH }),
            rpid: 'rpid',
            sender: { address: 'address', message: knobs.message, name: knobs.senderName },
            total: (knobs.total * 10 ** 18).toString(),
            creation_time: Date.now(),
        }
        const meta = new Map<string, unknown>([[RedPacketMetaKey, payload]])
        return (
            <Paper style={{ maxWidth: 400 }}>
                <div>
                    <DecryptPostSuccess
                        alreadySelectedPreviously={[]}
                        data={{
                            content: makeTypedMessageText('decrypted message!', meta),
                        }}
                        profiles={[]}
                    />
                </div>
            </Paper>
        )
    })
function createRedPacketKnobs() {
    const senderName = text('Sender name', 'Friendly neighborhood')

    const total = number('Total ETH', 5, { min: 0 })
    const shares = number('Shares', 1, { step: 1, min: 0 })
    const claimedAmount = number('Claimed ETH', 1, { min: 0 }) * 1000000000000000000

    const message = text('Message', 'Happy New Year')
    const status = select('Status', RedPacketStatus, RedPacketStatus.initial)

    const decimals = number('ERC20 Token decimal', 18, { min: 1, step: 1 })
    const erc20name = text('ERC20 Token name', 'QwQ coin')
    const erc20symbol = text('ERC20 Token symbol', 'TAT')
    return { shares, claimedAmount, message, status, decimals, erc20name, erc20symbol, total, senderName }
}

function createRecord(opts: {
    shares: number
    total: number
    message: string
    status: RedPacketStatus
    claimedAmount: number
    senderName: string
    type: EthereumTokenType
    token?: NonNullable<RedPacketRecord['raw_payload']>['token']
}): RedPacketRecord {
    const x: RedPacketRecord = {
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
        send_total: new BigNumber(opts.total),
        sender_address: 'sender_address',
        sender_name: opts.senderName,
        shares: new BigNumber(opts.shares),
        status: opts.status,
        token_type: opts.type,
        _found_in_url_: 'https://g.cn/',
        claim_amount: new BigNumber(opts.claimedAmount),
        raw_payload: { token: opts.token } as RedPacketJSONPayload,
        erc20_token: opts.token ? 'aefwf' : undefined,
    }
    // @ts-ignore
    if (opts.total === 0) delete x.send_total
    // @ts-ignore
    if (opts.shares === 0) delete x.shares
    return x
}
