export default {
    type: 'object',
    additionalProperties: true,
    properties: {
        contract_version: {
            type: 'number',
            title: 'contract_version',
        },
        contract_address: {
            type: 'string',
            title: 'contract_address',
        },
        rpid: {
            type: 'string',
            title: 'rpid',
        },
        // Note: in V2, using transaction hash as the database id, since rpid can't
        //  be fetched until transaction confirmed and the transaction dialog must
        //   stay open, which increases the possibility of history record lose.
        txid: {
            type: 'string',
            title: 'txid',
        },
        password: {
            type: 'string',
            title: 'password',
        },
        shares: {
            type: 'number',
            title: 'shares',
        },
        sender: {
            type: 'object',
            additionalProperties: true,
            properties: {
                address: {
                    type: 'string',
                    title: 'address',
                },
                name: {
                    type: 'string',
                    title: 'name',
                },
                message: {
                    type: 'string',
                    title: 'message',
                },
            },
            required: ['address', 'message', 'name'],
            title: 'sender',
        },
        is_random: {
            type: 'boolean',
            title: 'is_random',
        },
        total: {
            type: 'string',
            title: 'total',
        },
        creation_time: {
            type: 'number',
            title: 'creation_time',
        },
        duration: {
            type: 'number',
            title: 'duration',
        },
        network: {
            enum: ['Mainnet', 'Rinkeby', 'Ropsten'],
            type: 'string',
            title: 'network',
        },
        token_type: {
            enum: [0, 1, 2],
            type: 'number',
            title: 'token_type',
        },
        token: {
            type: 'object',
            additionalProperties: true,
            properties: {
                address: {
                    description: 'token address',
                    type: 'string',
                    title: 'address',
                },
                name: {
                    description: 'token name',
                    type: 'string',
                    title: 'name',
                },
                decimals: {
                    description: 'token decimal',
                    type: 'number',
                    title: 'decimals',
                },
                symbol: {
                    description: 'token symbol',
                    type: 'string',
                    title: 'symbol',
                },
            },
            required: ['address', 'decimals', 'name', 'symbol'],
            title: 'token',
        },
    },
    required: [
        'contract_address',
        'contract_version',
        // 'txid' // added in V2 not required
        'creation_time',
        'duration',
        'is_random',
        'password',
        'rpid',
        'sender',
        'shares',
        'token_type',
        'total',
    ],
}
