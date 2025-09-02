export const FIREFLY_BASE_URL = 'https://api.firefly.land'
export const FIREFLY_SITE_URL = 'https://firefly.social'

export const EMAIL_REGEX =
    /(([^\s"(),./:;<>@[\\\]]+(\.[^\s"(),./:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}\])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/u

export const URL_REGEX = /((https?:\/\/)?[\da-z]+([.-][\da-z]+)*\.[a-z]{2,}(:\d{1,5})?(\/[^\n ),>]*)?)/giu

export const FIREFLY_ROOT_URL =
    process.env.NEXT_PUBLIC_FIREFLY_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'https://api-dev.firefly.land' : 'https://api.firefly.land')

export const NOT_DEPEND_SECRET = '[TO_BE_REPLACED_LATER]'
