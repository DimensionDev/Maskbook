import type { ReactNode } from 'react'
export interface ConfirmOptions {
    title?: string
    content: ReactNode | string
    confirmLabel?: string
    onSubmit?(result: boolean | null): void
}
//# sourceMappingURL=types.d.ts.map
