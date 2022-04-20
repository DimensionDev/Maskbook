/**
 * Manage local static resource
 */
export const IconURLs: Readonly<Record<string, string>> = {
    referral: new URL('./images/referral.png', import.meta.url).toString(),
    referToFarm: new URL('./images/referToFarm.png', import.meta.url).toString(),
    buyToFarm: new URL('./images/buyToFarm.png', import.meta.url).toString(),
    createFarm: new URL('./images/createFarm.png', import.meta.url).toString(),
    rewards: new URL('./images/rewards.png', import.meta.url).toString(),
}
