import { useMemo } from 'react'
import type { ITO_JSONPayload } from '../types'

export function usePoolPayload(id: string) {
    return useMemo(() => {
        return {
            contract_address: '0x2b36b40d0e99b76ec9675bb7869aad25ab589dcd',
            creation_time: 1608514035000,
            total: '1000000000000000000',
            total_remaining: '1000000000000000000',
            claim_remaining: '100000000000000000',
            pid: '0xd7a5b7a7ede4d3390e83e9853883db43fd826de695f2fd6c1484d8aa36577ec5',
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
                name: 'Mask Token A',
                symbol: 'MSKA',
                decimals: 18,
            },
            limit: '100000000000000000',
            password: 'cb5b5e20-e49f-4cd4-b3f2-7c22851abb40',
            start_time: 1608513884702,
            end_time: 1608600284702,
            exchange_tokens: [
                {
                    type: 1,
                    address: '0xe379c7a6BA07575A5a49D8F8EBfD04921b86917D',
                    chainId: 3,
                    name: 'Mask Token B',
                    symbol: 'MSKB',
                    decimals: 18,
                },
                {
                    type: 1,
                    address: '0xb1465b954f893D921566D8BB4092B6f03FC8C313',
                    chainId: 3,
                    name: 'Mask Token C',
                    symbol: 'MSKC',
                    decimals: 18,
                },
            ],
            exchange_amounts: ['1000000000000000000', '2000000000000000000'],
        } as ITO_JSONPayload
    }, [])
}
