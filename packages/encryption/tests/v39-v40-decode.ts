import { expect, test } from 'vitest'
import { encodePayload, parsePayload } from '../src/index.js'
import { PayloadException } from '../src/types/index.js'

/* cspell:disable */
const oldInfraOutput =
    '\uD83C\uDFBC2/4|avkwBKqMpCKznGclvChuuh2AEExV0J14xI/KANhwiKJfVyfm2ObWb432E3aAOa7ImRoCd7/JK1d' +
    'DQWk4rt9NqajTEaajARMc9hJ9GmR8lorBNRNHlgj/h1KJYk5th7Nsr04PWO0nJUKiDH2CJwieSxW2YqxC' +
    'I1ceYKUYcZOsVJEZOrJ/IB8WUmU0|BjPbfiSAXCvc/2nqKv2nzQ==|Og1u5pLG9GiWsZbxQwHAGtL6Jqo=:||'
/* cspell:enable */

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
    if (v39.isErr()) expect(v39.error.message).toBe(PayloadException.UnknownVersion)
    else expect(v39.isErr()).toBeTruthy()

    const v40 = await encodePayload.NoSign({ version: -39 } as any)
    if (v40.isErr()) expect(v40.error.message).toBe(PayloadException.UnknownVersion)
    else expect(v40.isErr()).toBeTruthy()
})
