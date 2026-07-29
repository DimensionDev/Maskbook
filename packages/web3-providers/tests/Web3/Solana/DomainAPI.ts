import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfileIdentifier } from '@masknet/base'

const mocks = vi.hoisted(() => ({
    address: vi.fn((value: string) => value),
    createSolanaRpc: vi.fn(() => ({ kind: 'rpc' })),
    getSnsDomainsForAddress: vi.fn(),
    mainnet: vi.fn((value: string) => value),
    resolve: vi.fn(),
}))

vi.mock('@solana-name-service/sns-sdk-kit/address', () => ({
    getSnsDomainsForAddress: mocks.getSnsDomainsForAddress,
}))
vi.mock('@solana-name-service/sns-sdk-kit/domain', () => ({ resolve: mocks.resolve }))
vi.mock('@solana/kit', () => ({
    address: mocks.address,
    createSolanaRpc: mocks.createSolanaRpc,
    mainnet: mocks.mainnet,
}))

const { SolanaDomain } = await import('../../../src/Web3/Solana/apis/DomainAPI.js')
const { SolanaIdentityService } = await import('../../../src/Web3/Solana/state/IdentityService.js')

beforeEach(() => {
    mocks.address.mockClear()
    mocks.getSnsDomainsForAddress.mockReset()
    mocks.resolve.mockReset()
})

describe('SolanaDomain', () => {
    it.each(['alice.sol', 'alice.sns'])('resolves a suffixed domain: %s', async (domain) => {
        mocks.resolve.mockResolvedValue('AliceAddress')

        await expect(SolanaDomain.lookup(domain)).resolves.toBe('AliceAddress')
        expect(mocks.resolve).toHaveBeenCalledWith({ rpc: { kind: 'rpc' }, domain })
    })

    it('uses the canonical SNS suffix for a bare name', async () => {
        mocks.resolve.mockResolvedValue('AliceAddress')

        await expect(SolanaDomain.lookup('alice')).resolves.toBe('AliceAddress')
        expect(mocks.resolve).toHaveBeenCalledWith({ rpc: { kind: 'rpc' }, domain: 'alice.sns' })
    })

    it('returns an empty string when resolution fails', async () => {
        mocks.resolve.mockRejectedValue(new Error('domain not found'))

        await expect(SolanaDomain.lookup('missing.sns')).resolves.toBe('')
    })

    it('returns the first directly owned domain with the canonical SNS suffix', async () => {
        mocks.getSnsDomainsForAddress.mockResolvedValue([
            { domain: 'alice', domainAddress: 'AliceDomainAddress' },
            { domain: 'alice-2', domainAddress: 'AliceSecondDomainAddress' },
        ])

        await expect(SolanaDomain.reverse('AliceAddress')).resolves.toBe('alice.sns')
        expect(mocks.address).toHaveBeenCalledWith('AliceAddress')
        expect(mocks.getSnsDomainsForAddress).toHaveBeenCalledWith({
            rpc: { kind: 'rpc' },
            address: 'AliceAddress',
        })
    })

    it('returns undefined when an address owns no directly registered domain', async () => {
        mocks.getSnsDomainsForAddress.mockResolvedValue([])

        await expect(SolanaDomain.reverse('AliceAddress')).resolves.toBeUndefined()
    })
})

describe('SolanaIdentityService', () => {
    it.each(['alice.sol', 'alice.sns'])('finds a Solana domain in a social profile: %s', async (domain) => {
        mocks.resolve.mockResolvedValue('HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA')
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
        expect(mocks.resolve).toHaveBeenCalledWith({ rpc: { kind: 'rpc' }, domain })
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
