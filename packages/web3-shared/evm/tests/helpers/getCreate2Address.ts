import { describe, expect, test } from 'vitest'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { getCreate2Address } from '../../src/helpers/getCreate2Address.js'

describe('getCreate2Address', () => {
    test('should get create2 address', () => {
        const address = getCreate2Address(
            '0x8ba1f109551bd432803012645ac136ddd64dba72',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            web3_utils.keccak256('0x6394198df16000526103ff60206004601c335afa6040516060f3'),
        )
        expect(address).toBe('0xCEF4e1FD5A8168e2b5dBc9054E02c21ce95d89A7')
    })
})
