import { type TypedDataDomain, utils, type TypedDataField } from 'ethers'

export const splitSignature = (signature: string) => {
    return utils.splitSignature(signature)
}

export const encodeTypedData = (
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>,
) => {
    return utils._TypedDataEncoder.getPayload(domain, types, value)
}
