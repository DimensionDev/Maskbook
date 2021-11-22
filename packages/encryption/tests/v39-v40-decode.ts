import './setup'
import { expect, test } from '@jest/globals'
import { encodePayload, parsePayload } from '../src'
import { PayloadException } from '../src/types'

/* cspell:disable-next-line */
const oldInfraOutput = `🎼2/4|avkwBKqMpCKznGclvChuuh2AEExV0J14xI/KANhwiKJfVyfm2ObWb432E3aAOa7ImRoCd7/JK1dDQWk4rt9NqajTEaajARMc9hJ9GmR8lorBNRNHlgj/h1KJYk5th7Nsr04PWO0nJUKiDH2CJwieSxW2YqxCI1ceYKUYcZOsVJEZOrJ/IB8WUmU0|BjPbfiSAXCvc/2nqKv2nzQ==|Og1u5pLG9GiWsZbxQwHAGtL6Jqo=:||`

test('Parse v39 payload', async () => {
    const out = (await parsePayload(oldInfraOutput)).unwrap()
    expect(out).toMatchSnapshot('Payload parse v39 result')
})

test('Parse v40 payload', async () => {
    const out = (await parsePayload(oldInfraOutput.replace('2/4', '3/4'))).unwrap()
    expect(out).toMatchSnapshot('Payload parse v40 result')
})

test('Encode v39 or v40 payload is not supported', async () => {
    const v39 = await encodePayload.NoSign({ version: -39 } as any)
    expect(v39.err).toBeTruthy()
    expect((v39.val as any).message).toBe(PayloadException.UnknownVersion)

    const v40 = await encodePayload.NoSign({ version: -39 } as any)
    expect(v40.err).toBeTruthy()
    expect((v40.val as any).message).toBe(PayloadException.UnknownVersion)
})
