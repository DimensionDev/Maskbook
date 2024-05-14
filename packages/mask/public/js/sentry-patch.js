// Manually setup sentry integrations without enabling it at the first time.
// This is ok because sentry has a global internal state to track all integrations added.

Sentry.BrowserClient.__proto__.prototype._setupIntegrations.call({
    _isEnabled() {
        return true
    },
    _options: {
        integrations: [],
    },
})

undefined
