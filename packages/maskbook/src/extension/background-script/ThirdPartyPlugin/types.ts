export enum ThirdPartyPluginPermission {
    /**
     * This is the internal permission that used to indicate if we should inject
     * sdk into a content script.
     *
     * This permission will be automatically granted when user interact with the plugin in the SNS.
     *
     * This permission should be revoked once the popup has closed.
     */
    SDKEnabled,
    DEBUG_Profiles,
}
