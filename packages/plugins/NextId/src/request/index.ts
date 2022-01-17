const BASE_URL = 'https://js43x8ol17.execute-api.ap-east-1.amazonaws.com/api/v1/'

interface CreatePayloadBody {
    platform: string
    identity: string
    public_key: string
}

export async function createPayload(body: {}) {
    const response = await fetch(BASE_URL, {
        body: JSON.stringify({ ...body, active: '' }),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })
}
