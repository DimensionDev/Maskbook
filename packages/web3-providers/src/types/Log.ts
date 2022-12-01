export interface LogHubBase {
    captureException(error: Error): void
    captureMessage(message: string | object): void
}
