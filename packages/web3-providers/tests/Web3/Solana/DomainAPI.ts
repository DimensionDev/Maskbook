import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfileIdentifier } from '@masknet/base'

const mocks = vi.hoisted(() => ({
    resolve: vi.fn(),
    getAllDomains: vi.fn(),
    performReverseLookup: vi.fn(),
}))

vi.mock('@bonfida/spl-name-service/resolve', () => ({
    resolve: mocks.resolve,
}))

vi.mock('@bonfida/spl-name-service/utils', () => ({
    getAllDomains: mocks.getAllDomains,
    performReverseLookup: mocks.performReverseLookup,
}))

const { SolanaDomain } = await import('../../../src/Web3/Solana/apis/DomainAPI.js')
const { SolanaIdentityService } = await import('../../../src/Web3/Solana/state/IdentityService.js')

beforeEach(() => {
    mocks.resolve.mockReset()
    mocks.getAllDomains.mockReset()
    mocks.performReverseLookup.mockReset()
})

describe('SolanaDomain', () => {
    it.each(['alice.sol', 'alice.sns', 'ALICE.SNS', 'alice'])('resolves %s from the SNS root name', async (domain) => {
        mocks.resolve.mockResolvedValue({ toBase58: () => 'AliceAddress' })

        await expect(SolanaDomain.lookup(domain)).resolves.toBe('AliceAddress')
        expect(mocks.resolve).toHaveBeenCalledWith(expect.anything(), 'alice')
    })

    it('returns an empty string when resolution fails', async () => {
        mocks.resolve.mockRejectedValue(new Error('Domain not found'))

        await expect(SolanaDomain.lookup('missing.sns')).resolves.toBe('')
    })

    it('returns the first directly owned domain with the canonical SNS suffix', async () => {
        const domainKey = { toBase58: () => 'AliceDomainAddress' }
        mocks.getAllDomains.mockResolvedValue([domainKey])
        mocks.performReverseLookup.mockResolvedValue('alice')

        await expect(SolanaDomain.reverse('Fw1ETanDZafof7xEULsnq9UY6o71Tpds89tNwPkWLb1v')).resolves.toBe('alice.sns')
        expect(mocks.getAllDomains).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ toBase58: expect.any(Function) }),
        )
        expect(mocks.performReverseLookup).toHaveBeenCalledWith(expect.anything(), domainKey)
    })

    it('returns undefined when an address owns no directly registered domain', async () => {
        mocks.getAllDomains.mockResolvedValue([])

        await expect(SolanaDomain.reverse('Fw1ETanDZafof7xEULsnq9UY6o71Tpds89tNwPkWLb1v')).resolves.toBeUndefined()
        expect(mocks.performReverseLookup).not.toHaveBeenCalled()
    })
})

describe('SolanaIdentityService', () => {
    it.each(['alice.sol', 'alice.sns'])('finds a Solana domain in a social profile: %s', async (domain) => {
        mocks.resolve.mockResolvedValue({
            toBase58: () => 'HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA',
        })
        const service = new SolanaIdentityService()

        const result = await service.lookup({
            identifier: ProfileIdentifier.of('twitter.com', domain).unwrap(),
            nickname: `Alice ${domain}`,
            isOwner: true,
        })

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
            address: 'HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA',
            label: domain,
        })
        expect(mocks.resolve).toHaveBeenCalledOnce()
    })

    it('finds a Solana domain in a social profile bio', async () => {
        mocks.resolve.mockResolvedValue({
            toBase58: () => 'Fw1ETanDZafof7xEULsnq9UY6o71Tpds89tNwPkWLb1v',
        })
        const service = new SolanaIdentityService()

        const result = await service.lookup({
            identifier: ProfileIdentifier.of('twitter.com', 'jack82364').unwrap(),
            nickname: 'Jack',
            bio: 'bonfida.sns',
            isOwner: true,
        })

        expect(result).toEqual([
            expect.objectContaining({
                address: 'Fw1ETanDZafof7xEULsnq9UY6o71Tpds89tNwPkWLb1v',
                label: 'bonfida.sns',
            }),
        ])
        expect(mocks.resolve).toHaveBeenCalledWith(expect.anything(), 'bonfida')
    })

    it('ignores non-Solana domains', async () => {
        const service = new SolanaIdentityService()

        await expect(
            service.lookup({
                identifier: ProfileIdentifier.of('twitter.com', 'alice').unwrap(),
                nickname: 'Alice (alice.eth)',
                isOwner: true,
            }),
        ).resolves.toEqual([])
        expect(mocks.resolve).not.toHaveBeenCalled()
    })
})
