async function fetchFromRarible<T>(root: string, subPath: string, config = {} as RequestInit) {
    const response = await (
        await fetch(urlcat(root, subPath), {
            mode: 'cors',
            ...config,
        })
    ).json()

    return response as T
}

export function getToken
