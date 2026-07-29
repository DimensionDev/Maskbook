import { describe, expect, it } from 'vitest'
import { getDomainKey } from '@bonfida/spl-name-service/utils'

describe('vendored SPL name service', () => {
    it('derives the current SNS root account after the suffix is removed', async () => {
        const { pubkey, isSub } = await getDomainKey('bonfida')

        expect(isSub).toBe(false)
        expect(pubkey.toBase58()).toBe('Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb')
    })

    it('demonstrates why the legacy SDK must not receive the sns suffix', async () => {
        const { pubkey, isSub } = await getDomainKey('bonfida.sns')

        expect(isSub).toBe(true)
        expect(pubkey.toBase58()).toBe('ExjNqJWcdeE4n2ZFgjTh7gz5eaA8MMsjn1JKoaZXgJFw')
    })
})
