/// <reference types="@masknet/global-types/webpack" />

import type * as SentryBrowser from '@sentry/browser'

declare global {
    const Sentry: typeof SentryBrowser
}
