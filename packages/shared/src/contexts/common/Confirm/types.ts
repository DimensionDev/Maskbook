export interface ConfirmOptions {
    title?: string
    content: string
    confirmLabel?: string
    onConfirm?(): void
}
