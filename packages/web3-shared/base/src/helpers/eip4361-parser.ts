// https://eips.ethereum.org/EIPS/eip-4361

import { memoize } from 'lodash-es'

export enum EIP4361MessageState {
    NotContain = 0,
    Invalid = 1,
}

export interface ParsedEIP4361Message {
    domain: string
    address: string
    statement: string | undefined
    uri: string
    version: 1
    chainId: string
    nonce: string
    issued_at: Date
    expiration_time: Date | undefined
    not_before: Date | undefined
    request_id: string | undefined
    resources: string[] | undefined
}
export interface EIP4361Message {
    type: 'eip4361'
    message: string
    // undefined = contains invalid eip4361 payload
    parsed: ParsedEIP4361Message | undefined
    invalidFields: Array<keyof ParsedEIP4361Message>
}

const enum S {
    expect_header = 0,
    expect_address = 1,
    expect_lf_1 = 2,
    expect_optional_statement = 3,
    expect_lf_2 = 4,
    expect_uri = 6,
    expect_version = 7,
    expect_chain_id = 8,
    expect_nonce = 9,
    expect_issued_at = 10,
    expect_optional_expiration_time = 11,
    expect_optional_not_before = 12,
    expect_optional_request_id = 13,
    expect_optional_resources = 14,
    expect_resources_rest = 15,
}

function _parseEIP4361Message(message: string): ParsedEIP4361Message | EIP4361MessageState {
    if (!message.includes('wants you to sign in with your Ethereum account')) return EIP4361MessageState.NotContain

    let domain!: string,
        address!: string,
        statement: string | undefined,
        uri!: string,
        chainId!: string,
        nonce!: string,
        issued_at!: Date,
        expiration_time: Date | undefined,
        not_before: Date | undefined,
        request_id: string | undefined,
        resources: string[] | undefined,
        step = S.expect_header

    for (const line of message.split('\n')) {
        // [ scheme "://" ] domain %s" wants you to sign in with your Ethereum account:" LF
        if (step === S.expect_header) {
            const ends = ' wants you to sign in with your Ethereum account:'
            if (!line.endsWith(ends)) return EIP4361MessageState.Invalid
            domain = line.slice(0, -ends.length)
            step = S.expect_address
        }
        // address LF
        else if (step === S.expect_address) {
            if (!line.match(/^0x[\d,A-Fa-f]{40}$/g)) return EIP4361MessageState.Invalid
            address = line
            step = S.expect_lf_1
        }
        // LF
        else if (step === S.expect_lf_1) {
            if (line) return EIP4361MessageState.Invalid
            step = S.expect_optional_statement
        }
        // [ statement LF ]
        else if (step === S.expect_optional_statement) {
            if (line.startsWith('URI: ')) {
                uri = line.slice('URI: '.length)
                step = S.expect_version
                continue
            }
            if (line) {
                statement = line
                step = S.expect_lf_2
            } else {
                step = S.expect_uri
            }
        }
        // LF
        else if (step === S.expect_lf_2) {
            if (line) return EIP4361MessageState.Invalid
            step = S.expect_uri
        }
        // %s"URI: " uri LF
        else if (step === S.expect_uri) {
            if (!line.startsWith('URI: ')) return EIP4361MessageState.Invalid
            uri = line.slice('URI: '.length)
            step = S.expect_version
        }
        // %s"Version: " version LF
        else if (step === S.expect_version) {
            if (!line.startsWith('Version: ')) return EIP4361MessageState.Invalid
            const version = line.slice('Version: '.length)
            if (version.trim() !== '1') return EIP4361MessageState.Invalid
            step = S.expect_chain_id
        }
        // %s"Chain ID: " chain-id LF
        else if (step === S.expect_chain_id) {
            if (!line.startsWith('Chain ID: ')) return EIP4361MessageState.Invalid
            chainId = line.slice('Chain ID: '.length)
            step = S.expect_nonce
        }
        // %s"Nonce: " nonce LF
        else if (step === S.expect_nonce) {
            if (!line.startsWith('Nonce: ')) return EIP4361MessageState.Invalid
            nonce = line.slice('Nonce: '.length)
            step = S.expect_issued_at
        }
        // %s"Issued At: " issued-at
        else if (step === S.expect_issued_at) {
            if (!line.startsWith('Issued At: ')) return EIP4361MessageState.Invalid
            const date = new Date(line.slice('Issued At: '.length))
            if (date.toString() === 'Invalid Date') return EIP4361MessageState.Invalid
            issued_at = date
            step = S.expect_optional_expiration_time
        }
        // [ LF %s"Expiration Time: " expiration-time ]
        // [ LF %s"Not Before: " not-before ]
        // [ LF %s"Request ID: " request-id ]
        // [ LF %s"Resources:" resources ]
        else if (
            step === S.expect_optional_expiration_time ||
            step === S.expect_optional_not_before ||
            step === S.expect_optional_request_id ||
            step === S.expect_optional_resources
        ) {
            if (step === S.expect_optional_expiration_time) {
                if (line.startsWith('Expiration Time: ')) {
                    const date = new Date(line.slice('Expiration Time: '.length))
                    if (date.toString() === 'Invalid Date') return EIP4361MessageState.Invalid
                    expiration_time = date
                    step = S.expect_optional_not_before
                    continue
                }
            }
            if (step <= S.expect_optional_not_before) {
                if (line.startsWith('Not Before: ')) {
                    const date = new Date(line.slice('Not Before: '.length))
                    if (date.toString() === 'Invalid Date') return EIP4361MessageState.Invalid
                    not_before = date
                    step = S.expect_optional_request_id
                    continue
                }
            }
            if (step <= S.expect_optional_request_id) {
                if (line.startsWith('Request ID: ')) {
                    request_id = line.slice('Request ID: '.length)
                    step = S.expect_optional_resources
                    continue
                }
            }
            if (step <= S.expect_optional_resources) {
                if (line === 'Resources:') {
                    step = S.expect_resources_rest
                    continue
                }
            }
            return EIP4361MessageState.Invalid
        } else if (step === S.expect_resources_rest) {
            if (!line.startsWith('- ')) return EIP4361MessageState.Invalid
            ;(resources ??= []).push(line.slice('- '.length))
        } else throw new Error('Internal error')
    }

    return {
        domain,
        address,
        statement,
        uri,
        version: 1,
        chainId,
        nonce,
        issued_at,
        expiration_time,
        not_before,
        request_id,
        resources,
    }
}
export const parseEIP4361Message: (message: string, messageOrigin: string | undefined) => EIP4361Message | undefined =
    memoize(
        (message: string, messageOrigin: string | undefined): EIP4361Message | undefined => {
            const parsed = _parseEIP4361Message(message)
            if (parsed === EIP4361MessageState.NotContain) return undefined
            if (parsed === EIP4361MessageState.Invalid)
                return { type: 'eip4361', message, parsed: undefined, invalidFields: [] }
            const invalidFields: Array<keyof ParsedEIP4361Message> = []
            if (!messageOrigin || !isEIP4361DomainMatch(messageOrigin, parsed)) invalidFields.push('domain')
            if (parsed.expiration_time && parsed.expiration_time < new Date()) invalidFields.push('expiration_time')
            if (parsed.not_before && parsed.not_before > new Date()) invalidFields.push('not_before')
            return { type: 'eip4361', message, parsed, invalidFields }
        },
        (a, b) => a + b,
    )
export function isEIP4361DomainMatch(messageOrigin: string, message: ParsedEIP4361Message): boolean {
    if (messageOrigin === message.domain) return true
    if ('https://' + message.domain === messageOrigin) return true
    if ('http://' + message.domain === messageOrigin) return true
    return false
}
