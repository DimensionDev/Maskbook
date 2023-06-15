export type SetupGuideContext = {
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

export enum BooleanPreference {
    False = 0,
    Default = 1,
    True = 2,
}
