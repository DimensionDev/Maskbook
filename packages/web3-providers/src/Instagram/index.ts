import { getCookie } from '@masknet/shared-base'
import { fetchJSON } from '../helpers/fetchJSON.js'

const UPLOAD_AVATAR_URL = 'https://www.instagram.com/accounts/web_change_profile_picture/'

export class Instagram {
    static async uploadUserAvatar(image: File | Blob, userId: string) {
        const formData = new FormData()
        const csrfToken = getCookie('csrfToken')
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
