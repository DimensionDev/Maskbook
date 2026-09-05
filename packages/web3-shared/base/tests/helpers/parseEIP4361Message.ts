import { expect, test } from 'vitest'
import { parseEIP4361Message } from '../../src/helpers/eip4361-parser.js'

const case1 = `example.com wants you to sign in with your Ethereum account:
0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

I accept the ExampleOrg Terms of Service: https://example.com/tos

URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: 32891756
Issued At: 2021-09-30T16:25:24Z
Resources:
- ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/
- https://example.com/my-web2-claim.json`
const case2 = `example.com:3388 wants you to sign in with your Ethereum account:
0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

I accept the ExampleOrg Terms of Service: https://example.com/tos

URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: 32891756
Issued At: 2021-09-30T16:25:24Z
Resources:
- ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/
- https://example.com/my-web2-claim.json`
const case3 = `https://example.com wants you to sign in with your Ethereum account:
0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

I accept the ExampleOrg Terms of Service: https://example.com/tos

URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: 32891756
Issued At: 2021-09-30T16:25:24Z
Resources:
- ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/
- https://example.com/my-web2-claim.json`
test('parse normal EIP4361Message', () => {
    expect(parseEIP4361Message(case1, 'https://example.com')).toMatchInlineSnapshot(`
      {
        "invalidFields": [],
        "message": "example.com wants you to sign in with your Ethereum account:
      0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

      I accept the ExampleOrg Terms of Service: https://example.com/tos

      URI: https://example.com/login
      Version: 1
      Chain ID: 1
      Nonce: 32891756
      Issued At: 2021-09-30T16:25:24Z
      Resources:
      - ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/
      - https://example.com/my-web2-claim.json",
        "parsed": {
          "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          "chainId": "1",
          "domain": "example.com",
          "expiration_time": undefined,
          "issued_at": 2021-09-30T16:25:24.000Z,
          "nonce": "32891756",
          "not_before": undefined,
          "request_id": undefined,
          "resources": [
            "ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/",
            "https://example.com/my-web2-claim.json",
          ],
          "statement": "I accept the ExampleOrg Terms of Service: https://example.com/tos",
          "uri": "https://example.com/login",
          "version": 1,
        },
        "type": "eip4361",
      }
    `)
    expect(parseEIP4361Message(case2, 'https://example.com:3388')).toMatchInlineSnapshot(`
      {
        "invalidFields": [],
        "message": "example.com:3388 wants you to sign in with your Ethereum account:
      0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

      I accept the ExampleOrg Terms of Service: https://example.com/tos

      URI: https://example.com/login
      Version: 1
      Chain ID: 1
      Nonce: 32891756
      Issued At: 2021-09-30T16:25:24Z
      Resources:
      - ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/
      - https://example.com/my-web2-claim.json",
        "parsed": {
          "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          "chainId": "1",
          "domain": "example.com:3388",
          "expiration_time": undefined,
          "issued_at": 2021-09-30T16:25:24.000Z,
          "nonce": "32891756",
          "not_before": undefined,
          "request_id": undefined,
          "resources": [
            "ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/",
            "https://example.com/my-web2-claim.json",
          ],
          "statement": "I accept the ExampleOrg Terms of Service: https://example.com/tos",
          "uri": "https://example.com/login",
          "version": 1,
        },
        "type": "eip4361",
      }
    `)
    expect(parseEIP4361Message(case3, 'https://example.com')).toMatchInlineSnapshot(`
      {
        "invalidFields": [],
        "message": "https://example.com wants you to sign in with your Ethereum account:
      0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

      I accept the ExampleOrg Terms of Service: https://example.com/tos

      URI: https://example.com/login
      Version: 1
      Chain ID: 1
      Nonce: 32891756
      Issued At: 2021-09-30T16:25:24Z
      Resources:
      - ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/
      - https://example.com/my-web2-claim.json",
        "parsed": {
          "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          "chainId": "1",
          "domain": "https://example.com",
          "expiration_time": undefined,
          "issued_at": 2021-09-30T16:25:24.000Z,
          "nonce": "32891756",
          "not_before": undefined,
          "request_id": undefined,
          "resources": [
            "ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/",
            "https://example.com/my-web2-claim.json",
          ],
          "statement": "I accept the ExampleOrg Terms of Service: https://example.com/tos",
          "uri": "https://example.com/login",
          "version": 1,
        },
        "type": "eip4361",
      }
    `)
})

test('handle invalid EIP4361Message', () => {
    expect(parseEIP4361Message(case1, 'https://evil.com')).toMatchInlineSnapshot(`
      {
        "invalidFields": [
          "domain",
        ],
        "message": "example.com wants you to sign in with your Ethereum account:
      0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

      I accept the ExampleOrg Terms of Service: https://example.com/tos

      URI: https://example.com/login
      Version: 1
      Chain ID: 1
      Nonce: 32891756
      Issued At: 2021-09-30T16:25:24Z
      Resources:
      - ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/
      - https://example.com/my-web2-claim.json",
        "parsed": {
          "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          "chainId": "1",
          "domain": "example.com",
          "expiration_time": undefined,
          "issued_at": 2021-09-30T16:25:24.000Z,
          "nonce": "32891756",
          "not_before": undefined,
          "request_id": undefined,
          "resources": [
            "ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/",
            "https://example.com/my-web2-claim.json",
          ],
          "statement": "I accept the ExampleOrg Terms of Service: https://example.com/tos",
          "uri": "https://example.com/login",
          "version": 1,
        },
        "type": "eip4361",
      }
    `)
    expect(parseEIP4361Message('A random message', 'https://example.com')).toMatchInlineSnapshot('undefined')
    expect(parseEIP4361Message('wants you to sign in with your Ethereum account', 'https://example.com'))
        .toMatchInlineSnapshot(`
      {
        "invalidFields": [],
        "message": "wants you to sign in with your Ethereum account",
        "parsed": undefined,
        "type": "eip4361",
      }
    `)
})
