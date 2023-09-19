import urlcat from 'urlcat'
import { getHeaders } from './getTokens.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { TwitterBaseAPI } from '../../entry-types.js'

const UPLOAD_AVATAR_URL = 'https://upload.twitter.com/i/media/upload.json'

export async function uploadMedia(image: File | Blob): Promise<TwitterBaseAPI.TwitterResult> {
    const headers = await getHeaders()

    // INIT
    const initURL = urlcat(UPLOAD_AVATAR_URL, {
        command: 'INIT',
        total_bytes: image.size,
        media_type: encodeURIComponent(image.type),
    })
    const initRes = await fetchJSON<{
        media_id_string: string
    }>(initURL, {
        method: 'POST',
        headers,
        credentials: 'include',
    })

    // APPEND
    const mediaId = initRes.media_id_string
    const appendURL = urlcat(UPLOAD_AVATAR_URL, {
        command: 'APPEND',
        media_id: mediaId,
        segment_index: 0,
    })
    const formData = new FormData()
    formData.append('media', image)
    await fetch(appendURL, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
    })

    // FINALIZE
    const finalizeURL = urlcat(UPLOAD_AVATAR_URL, {
        command: 'FINALIZE',
        media_id: mediaId,
    })
    return fetchJSON<TwitterBaseAPI.TwitterResult>(finalizeURL, {
        method: 'POST',
        headers,
        credentials: 'include',
    })
}
