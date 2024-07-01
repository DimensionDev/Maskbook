import { http, HttpResponse } from 'msw'

export const BundlerHandlers = [
    http.get('https://829m2iqdy4.execute-api.ap-east-1.amazonaws.com/healthz', () => {
        return HttpResponse.json(
            {
                hello: 'bundler',
                bundler_eoa: '0x441D3F77bA64d427f31d215b504D9fF56301ACF6',
                chain_id: '137',
                entrypoint_contract_address: '0x59d2a8082bbd0efd8a2737e24f5ee34ec279a386',
            },
            { status: 200 },
        )
    }),
    http.get('https://9rh2q3tdqj.execute-api.ap-east-1.amazonaws.com/healthz', () => {
        return HttpResponse.json(
            {
                hello: 'bundler',
                bundler_eoa: '0x441D3F77bA64d427f31d215b504D9fF56301ACF6',
                chain_id: '137',
                entrypoint_contract_address: '0x59d2a8082bbd0efd8a2737e24f5ee34ec279a386',
            },
            { status: 200 },
        )
    }),
    http.get('https://rrh4bmg4j9.execute-api.ap-east-1.amazonaws.com/Prod/operation', () => {
        return HttpResponse.json(
            {
                tokenTransferTx: '0xfc6e7a01101e17994538dd014628602a44b03a00980a66afbd1697c8095b18f4',
                createdAt: 1669970510248,
                twitterHandle: 'test',
                nonce: 1,
                id: '29fdf280-721d-11ed-a079-6f6f72e92e8a',
                walletAddress: '0x7171C1fD1694bdfe79B6c38A8696CF7E8A96D9BE',
                ownerAddress: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
            },
            { status: 200 },
        )
    }),
]
