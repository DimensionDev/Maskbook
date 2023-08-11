export function getPostPayload(): [string, '1' | '2'] | undefined {
    const params = new URLSearchParams(location.search)
    if (params.has('PostData_v2')) return [params.get('PostData_v2')!, '2']
    if (params.has('PostData_v1')) return [params.get('PostData_v1')!, '1']
    return
}
