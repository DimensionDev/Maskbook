export interface SetupGuideContext {
    /** The persona to be connected */
    persona?: string
    /**
     * The user name given by user
     * @todo Rename to userId
     * */
    username?: string
    /** The WIP step */
    status?: SetupGuideStep
    /** Specified tab id to activate setup guide */
    tabId?: string
}

export enum SetupGuideStep {
    FindUsername = 'find-username',
    CheckConnection = 'check-connection',
    VerifyOnNextID = 'next-id-verify',
    PinExtension = 'pin-extension',
    Close = 'close',
}
