export const SHOYU_TYPES = {
    Ask: [
        { name: 'signer', type: 'address' },
        { name: 'proxy', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'strategy', type: 'address' },
        { name: 'currency', type: 'address' },
        { name: 'recipient', type: 'address' },
        { name: 'deadline', type: 'uint256' },
        { name: 'params', type: 'bytes' },
    ],
    Bid: [
        { name: 'askHash', type: 'bytes32' },
        { name: 'signer', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: 'recipient', type: 'address' },
        { name: 'referrer', type: 'address' },
    ],
}
