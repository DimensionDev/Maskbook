import './setup'
import { expect, test } from '@jest/globals'
import { parsePayload } from '../src'

/* cspell:disable-next-line */
const oldInfraOutput = `🎼4/4|avkwBKqMpCKznGclvChuuh2AEExV0J14xI/KANhwiKJfVyfm2ObWb432E3aAOa7ImRoCd7/JK1dDQWk4rt9NqajTEaajARMc9hJ9GmR8lorBNRNHlgj/h1KJYk5th7Nsr04PWO0nJUKiDH2CJwieSxW2YqxCI1ceYKUYcZOsVJEZOrJ/IB8WUmU0|BjPbfiSAXCvc/2nqKv2nzQ==|Og1u5pLG9GiWsZbxQwHAGtL6Jqo=|_|Aq/bVWAKvodJuURGk3enjE1gUiu2SELM8IIKIlNGqOWM|1|ZmFjZWJvb2suY29tLzEwMDAyNzU2MjI0OTU3NA==:||`
test('Be able to parse current payload', async () => {
    const out = (await parsePayload(oldInfraOutput)).unwrap()
    expect(out).toMatchSnapshot('Old infra output for message "test"')
})
