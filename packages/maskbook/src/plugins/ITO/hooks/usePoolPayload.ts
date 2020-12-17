import { useMemo } from 'react'
import type { ITO_JSONPayload } from '../types'

export function usePoolPayload(id: string) {
    return useMemo(() => {
        return {
            contract_address: '0x9dc7441f8df2c0479f00db0df31e5d23361271c8',
            creation_time: 1608189038000,
            total: '100',
            total_remaining: '100',
            claim_remaining: '10',
            pid: '0xe507e89a2a9a4cbac739b5484dd7c71f3d68f0dc1b159f406665009a6546aa31',
            sender: {
                address: '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
                name: 'Mask',
                message: 'Test ITO Packet',
            },
            chain_id: 3,
            token: {
                type: 1,
                address: '0xE54bf69054Da160c597F8b5177924B9e4b81E930',
                chainId: 3,
                name: '',
                symbol: '',
                decimals: 0,
            },
            limit: '10',
            password: '029307b0-4f62-4c23-9595-add7feca91ee',
            start_time: 1608189022974,
            end_time: 1608275422974,
            exchange_tokens: [
                {
                    type: 1,
                    address: '0xe379c7a6BA07575A5a49D8F8EBfD04921b86917D',
                    chainId: 3,
                    name: '',
                    symbol: '',
                    decimals: 0,
                },
                {
                    type: 1,
                    address: '0xb1465b954f893D921566D8BB4092B6f03FC8C313',
                    chainId: 3,
                    name: '',
                    symbol: '',
                    decimals: 0,
                },
            ],
            exchange_amounts: ['1000', '10000'],
        } as ITO_JSONPayload
    }, [])
}
