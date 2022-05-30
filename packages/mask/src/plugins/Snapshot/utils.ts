export const getSnapshotVoteType = (type: string) => ({
    Vote: [
        {
            name: 'from',
            type: 'address',
        },
        {
            name: 'space',
            type: 'string',
        },
        {
            name: 'timestamp',
            type: 'uint64',
        },
        {
            name: 'proposal',
            type: 'string',
        },
        {
            name: 'choice',
            type: type === 'single-choice' ? 'uint32' : 'uint32[]',
        },
        {
            name: 'metadata',
            type: 'string',
        },
    ],
})
