// cspell:disable
const clientId =
    process.env.GOOGLE_CLIENT_ID || '884348965548-npd1mffii0tbrr87eb2fm73ue022k3t3.apps.googleusercontent.com'
// cspell:enable
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email']
const redirectUri = browser.runtime.getURL('oauth2.html')

export async function getAccessToken() {
    // const url = browser.identity.getRedirectURL('oauth2')
    return new Promise<string>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            console.log('token', token)
            resolve(token)
        })
    })
    // const token = await browser.identity.launchWebAuthFlow({
    //     url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(url)}&response_type=code&scope=${encodeURIComponent(SCOPES.join(' '))}&access_type=offline`,
    //     interactive: true,
    // })
    // // return token
}
