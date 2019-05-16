/** [network, username] */
export interface Identifier extends Array<string> {
    /**
     * Which social network
     * Special value: "localhost"
     */
    [0]: string
    /** Unique id in the current "network" */
    [1]: string
}
export interface PersonRecord {
    identifier: Identifier
    /** Friend of mine? */
    isFriend: boolean
    /** Last check time of isFriend */
    isFriendLastCheckTime: Date
}
