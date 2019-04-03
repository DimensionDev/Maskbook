import { LiveSelector } from '@holoflows/kit/es/DOM/LiveSelector'

export const myUsername = new LiveSelector().querySelector<HTMLAnchorElement>(
    `[aria-label="Facebook"][role="navigation"] [data-click="profile_icon"] a`,
)
