export interface CustomEvents {
    paste: [text: string | { type: 'image'; value: Array<number> }]
    input: [text: string]
    instagramUpload: [url: string]
}
