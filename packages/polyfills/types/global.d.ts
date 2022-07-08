declare function r2d2Fetch(url: RequestInfo, init?: RequestInit): Promise<Response>

type SceneTypes = 'profile' | 'unknown'

interface WindowEventMap {
    scenechange: CustomEvent<{
        scene: SceneTypes
        value?: string
    }>
}
