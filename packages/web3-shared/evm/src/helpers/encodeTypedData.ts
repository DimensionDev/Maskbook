import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import * as web3_eth_abi from /* webpackDefer: true */ 'web3-eth-abi'

interface TypedDataField {
    name: string
    type: string
}

interface TypedDataDomain {
    [key: string]: any
}

// Helper function to find types for a given type name
const findTypes = (types: Record<string, TypedDataField[]>, primaryType: string): string[] => {
    let result: string[] = []
    for (const type of types[primaryType]!) {
        result.push(`${type.type} ${type.name}`)
        if (types[type.type]) {
            result = result.concat(findTypes(types, type.type))
        }
    }
    return result
}

// Recursively find all the dependencies of a type
const dependencies = (types: Record<string, TypedDataField[]>, primaryType: string, found: string[] = []): string[] => {
    if (found.includes(primaryType)) {
        return found
    }
    found.push(primaryType)
    for (const field of types[primaryType]!) {
        for (const dep of dependencies(types, field.type, found)) {
            if (!found.includes(dep)) {
                found.push(dep)
            }
        }
    }
    return found
}

// Encode the type data for hashing
const encodeType = (types: Record<string, TypedDataField[]>, primaryType: string): string => {
    const depSet = dependencies(types, primaryType)
    depSet.sort((a, b) =>
        a < b ? -1
        : a > b ? 1
        : 0,
    )
    return depSet.map((type) => `${type}(${types[type].map(({ name, type }) => `${type} ${name}`).join(',')})`).join('')
}

// Generate the EIP-712 hash
const typeHash = (types: Record<string, TypedDataField[]>, primaryType: string): string => {
    return web3_utils.sha3(encodeType(types, primaryType))!
}

export function encodeTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    message: Record<string, any>,
): string {
    const coder = new web3_eth_abi.AbiCoder()
    const domainSeparator: string = web3_utils.sha3(
        coder.encodeParameters(
            Object.keys(domain).map(() => 'string'),
            Object.values(domain),
        ),
    )!

    const messageHash: string = web3_utils.sha3(
        coder.encodeParameters(findTypes(types, 'Message'), Object.values(message)),
    )!

    const payload: string = web3_utils.soliditySha3(
        '0x1901',
        domainSeparator,
        web3_utils.sha3(coder.encodeParameters(['bytes32', 'bytes32'], [typeHash(types, 'Message'), messageHash]))!,
    )!

    return payload
}
