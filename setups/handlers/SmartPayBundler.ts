import { rest } from 'msw'

export const BundlerHandlers = [
    rest.get('https://829m2iqdy4.execute-api.ap-east-1.amazonaws.com/healthz', (request, response, context) => {
        console.log('DEBUG: hit!')

        return response(
            context.status(200),
            context.json({
                hello: 'bundler',
                bundler_eoa: '0x441D3F77bA64d427f31d215b504D9fF56301ACF6',
                chain_id: '137',
                entrypoint_contract_address: '0x8A42F70047a99298822dD1dbA34b454fc49913F2',
            }),
        )
    }),
]
