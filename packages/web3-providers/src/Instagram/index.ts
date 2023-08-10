import { fetchJSON } from '../helpers/fetchJSON.js'
import type { InstagramBaseAPI } from '../entry-types.js'

const UPLOAD_AVATAR_URL = 'https://www.instagram.com/accounts/web_change_profile_picture/'

function getCSRFToken() {
    const csrfToken = document.cookie.split('; ').find((x) => x.includes('csrftoken'))
    if (!csrfToken) return ''
    const [, value] = csrfToken.split('=')
    return value
}

export class InstagramAPI implements InstagramBaseAPI.Provider {
    async uploadUserAvatar(image: File | Blob, userId: string) {
        const formData = new FormData()
        const csrfToken = getCSRFToken()
        formData.append('profile_pic', image)

        return fetchJSON<{
            changed_profile: boolean
            profile_pic_url_hd: string
        }>(UPLOAD_AVATAR_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'x-csrfToken': csrfToken,
                referer: `https://www.instagram.com/${userId}/`,
            },
            body: formData,
        })
    }
}
