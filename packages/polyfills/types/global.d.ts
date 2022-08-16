/** @deprecated use fetch */
declare function r2d2Fetch(url: RequestInfo, init?: RequestInit): Promise<Response>

interface WindowEventMap {
    scenechange: CustomEvent<{ scene: 'profile'; value: string }> | CustomEvent<{ scene: 'unknown' }>
}
