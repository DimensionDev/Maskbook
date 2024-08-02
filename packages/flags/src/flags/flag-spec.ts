import z from 'zod'

const bool = z.boolean()
const str = z.string()
const num = z.number()

const FlagSpec = z.object({
    mask_sdk_enabled: bool,
    support_testnet_switch: bool,

    shadowRootInit: z.object({
        mode: z.enum(['open', 'closed']),
        delegatesFocus: bool.optional(),
    }),

    using_emoji_flag: bool,
    post_actions_enabled: bool,
    sandboxedPluginRuntime: bool,

    twitter_token: str,

    sentry_earliest_version: str.optional(),
    sentry_sample_rate: num,
    sentry_enabled: bool,
    sentry_event_enabled: bool,
    sentry_exception_enabled: bool,
    sentry_fetch_transaction_enabled: bool,
    sentry_async_transaction_enabled: bool,

    mixpanel_earliest_version: str.optional(),
    mixpanel_sample_rate: num,
    mixpanel_enabled: bool,
    mixpanel_event_enabled: bool,
    mixpanel_exception_enabled: bool,
    mixpanel_project_token: str,

    wc_relay_url: str,
    wc_project_id: str,
    wc_mode: z.enum(['error', 'debug']),
    wc_enabled: bool,

    globalDisabledPlugins: str.array(),
})
export const FlagPatchSpec = FlagSpec.partial()
export type FlagSpec = z.infer<typeof FlagSpec>
export type FlagPatchSpec = z.infer<typeof FlagPatchSpec>
