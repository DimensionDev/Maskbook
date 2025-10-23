import Services from '#services'

if (location.origin.endsWith('.firefly.social') && location.pathname === '/api/auth/callback/twitter') {
    const params = new URLSearchParams(location.search)
    Services.Helper.resolveXOAuth(params.get('oauth_verifier'), params.get('oauth_token'))
    window.close()
}
