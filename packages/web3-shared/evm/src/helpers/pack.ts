import * as web3_utils from /* webpackDefer: true */ 'web3-utils'

export function pack(types: string[], values: any[]) {
    if (types.length !== values.length) {
        throw new Error('Number of types does not match number of values.')
    }

    let result = '0x'

    for (let i = 0; i < types.length; i += 1) {
        switch (types[i]) {
            case 'address':
                result += values[i].slice(2).padStart(40, '0')
                break
            case 'uint256':
                result += BigInt(values[i]).toString(16).padStart(64, '0')
                break
            case 'bytes32':
                result += web3_utils.utf8ToHex(values[i]).slice(2).padStart(64, '0')
                break
            case 'bool':
                result += values[i] ? '01' : '00'
                break
            // ... you can continue adding more cases for other data types
            default:
                throw new Error(`Unsupported type ${types[i]}`)
        }
    }

    return result
}
