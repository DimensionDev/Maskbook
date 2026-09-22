import Services from '#services'

const allowedOAuthCallbackOrigins = new Set(['https://firefly.social', 'https://canary.firefly.social'])

if (allowedOAuthCallbackOrigins.has(location.origin) && location.pathname === '/api/auth/callback/twitter') {
    const params = new URLSearchParams(location.search)
    Services.Helper.resolveXOAuth(params.get('oauth_verifier'), params.get('oauth_token'))
    window.close()
}
