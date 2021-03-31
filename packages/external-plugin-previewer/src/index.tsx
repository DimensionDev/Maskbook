/// <reference path="./global.d.ts" />
export function Renderer(data: RenderData) {}
export interface RenderData {
    template: string
    script: string
    payload: unknown
}
