export interface CustomEvents {
    paste: [string | { type: 'image'; value: Array<number> }]
    input: [string]
}
