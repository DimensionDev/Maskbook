// cspell:disable
const clientId =
    process.env.GOOGLE_CLIENT_ID || '18954568633-c7has4fcrm5b7fop5si83fleb51oodji.apps.googleusercontent.com'
// cspell:enable
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email']
const redirectUri = browser.runtime.getURL('oauth2.html')

export async function getAccessToken() {
    const url = browser.identity.getRedirectURL()
    const token = await browser.identity.launchWebAuthFlow({
        url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(url)}&response_type=code&scope=${encodeURIComponent(SCOPES.join(' '))}&access_type=offline`,
        interactive: true,
    })
    return token
}
