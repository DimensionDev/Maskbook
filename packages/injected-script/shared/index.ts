export const CustomEventId = 'c8a6c18e-f6a3-472a-adf3-5335deb80db6'
export interface InternalEvents {
    /** Simulate a paste event on the activeElement */
    paste: [text: string]
    /** Simulate an image paste event on the activeElement */
    pasteImage: [number[]]
    /** Simulate a input event on the activeElement */
    input: [text: string]
    /** Simulate a image upload on the activeElement on instagram */
    instagramUpload: [url: string]
    /**
     * Simulate an image upload event.
     *
     * How to use:
     * Call this event, then invoke the file selector (SNS). It will invoke click on some input, then let's replace with the result.
     */
    hookInputUploadOnce: [format: string, fileName: string, file: number[]]
}

export type EventItemBeforeSerialization = [keyof InternalEvents, unknown[]]
