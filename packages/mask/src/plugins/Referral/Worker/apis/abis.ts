export const REFERRAL_FARMS_V1_ABI = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'farmHash',
                type: 'bytes32',
            },
            {
                indexed: false,
                internalType: 'uint128',
                name: 'delta',
                type: 'uint128',
            },
            {
                indexed: false,
                internalType: 'bool',
                name: 'isNegative',
                type: 'bool',
            },
        ],
        name: 'FarmDepositChange',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'sponsor',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'bytes24',
                name: 'rewardTokenDefn',
                type: 'bytes24',
            },
            {
                indexed: true,
                internalType: 'bytes24',
                name: 'referredTokenDefn',
                type: 'bytes24',
            },
            {
                indexed: false,
                internalType: 'bytes32',
                name: 'farmHash',
                type: 'bytes32',
            },
        ],
        name: 'FarmExists',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'farmHash',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'key',
                type: 'bytes32',
            },
            {
                indexed: false,
                internalType: 'bytes',
                name: 'value',
                type: 'bytes',
            },
        ],
        name: 'FarmMetastate',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'farmHash',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'bytes24',
                name: 'token',
                type: 'bytes24',
            },
            {
                indexed: false,
                internalType: 'uint8',
                name: 'change',
                type: 'uint8',
            },
        ],
        name: 'FarmTokenChange',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'caller',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'bytes24',
                name: 'rewardTokenDefn',
                type: 'bytes24',
            },
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'farmHash',
                type: 'bytes32',
            },
            {
                indexed: false,
                internalType: 'uint128',
                name: 'value',
                type: 'uint128',
            },
            {
                indexed: false,
                internalType: 'bytes32',
                name: 'leafHash',
                type: 'bytes32',
            },
        ],
        name: 'RewardsHarvested',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'confirmationsAddr_',
                type: 'address',
            },
        ],
        name: 'configure',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes24',
                name: 'rewardTokenDefn',
                type: 'bytes24',
            },
            {
                internalType: 'bytes24',
                name: 'referredTokenDefn',
                type: 'bytes24',
            },
            {
                components: [
                    {
                        internalType: 'bytes32',
                        name: 'key',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bytes',
                        name: 'value',
                        type: 'bytes',
                    },
                ],
                internalType: 'struct KeyVal[]',
                name: 'metastate',
                type: 'tuple[]',
            },
        ],
        name: 'configureMetastate',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
        ],
        name: 'devRescueErc20',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
        ],
        name: 'devRescueNative',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'getAccountNonce',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'farmHash',
                type: 'bytes32',
            },
        ],
        name: 'getFarmDepositRemaining',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'farmHash',
                type: 'bytes32',
            },
            {
                internalType: 'int256',
                name: 'idx',
                type: 'int256',
            },
        ],
        name: 'getFarmPeriodReward',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint128',
                        name: 'reward',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint128',
                        name: 'activationPeriod',
                        type: 'uint128',
                    },
                ],
                internalType: 'struct FarmPeriodReward',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'farmHash',
                type: 'bytes32',
            },
            {
                internalType: 'bytes24',
                name: 'referredTokenDefn',
                type: 'bytes24',
            },
        ],
        name: 'getFarmReferredTokenStatus',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'bytes32',
                        name: 'farmHash',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'uint128',
                        name: 'value',
                        type: 'uint128',
                    },
                    {
                        internalType: 'bytes24',
                        name: 'rewardTokenDefn',
                        type: 'bytes24',
                    },
                    {
                        internalType: 'uint64',
                        name: 'effectNonce',
                        type: 'uint64',
                    },
                ],
                internalType: 'struct ReferralFarmsV1.HarvestRequest[]',
                name: 'reqs',
                type: 'tuple[]',
            },
            {
                internalType: 'bytes32[][]',
                name: 'proofs',
                type: 'bytes32[][]',
            },
            {
                internalType: 'uint64[]',
                name: 'skipEffectNonces',
                type: 'uint64[]',
            },
        ],
        name: 'harvestRewards',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes24',
                name: 'rewardToken',
                type: 'bytes24',
            },
            {
                internalType: 'bytes24',
                name: 'referredTokenDefn',
                type: 'bytes24',
            },
            {
                internalType: 'uint128',
                name: 'rewardDeposit',
                type: 'uint128',
            },
            {
                components: [
                    {
                        internalType: 'bytes32',
                        name: 'key',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bytes',
                        name: 'value',
                        type: 'bytes',
                    },
                ],
                internalType: 'struct KeyVal[]',
                name: 'metastate',
                type: 'tuple[]',
            },
        ],
        name: 'increaseReferralFarm',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
]

export const ERC20_ABI = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                name: '_owner',
                type: 'address',
            },
            {
                name: '_spender',
                type: 'address',
            },
        ],
        name: 'allowance',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
]
