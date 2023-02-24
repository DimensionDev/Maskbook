/// <reference types="@masknet/global-types/webpack" />

declare module globalThis {
    const Sentry: undefined | typeof import('@sentry/browser')
}
