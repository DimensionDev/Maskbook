export interface SetupGuideContext {
    /** The persona to be connected */
    persona?: string
    /** The user name given by user */
    username?: string
    /** The WIP step */
    status?: SetupGuideStep
}

export enum SetupGuideStep {
    FindUsername = 'find-username',
    VerifyOnNextID = 'next-id-verify',
    PinExtension = 'pin-extension',
    Close = 'close',
}
