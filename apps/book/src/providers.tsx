import { createContext, use, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { DialogStackingProvider, DisableShadowRootContext, MaskThemeProvider } from '@masknet/theme'

export type PaletteMode = 'light' | 'dark'

interface ModeContext {
    mode: PaletteMode
    setMode: (mode: PaletteMode) => void
    toggle: () => void
}

const ModeContext = createContext<ModeContext>({
    mode: 'light',
    setMode: () => {},
    toggle: () => {},
})

export function useMode(): ModeContext {
    return use(ModeContext)
}

const STORAGE_KEY = 'mask-book:palette'

function readInitialMode(): PaletteMode {
    try {
        const saved = globalThis.localStorage?.getItem(STORAGE_KEY)
        if (saved === 'light' || saved === 'dark') return saved
    } catch {}
    return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function Providers({ children }: PropsWithChildren) {
    const [mode, setMode] = useState<PaletteMode>(readInitialMode)

    useEffect(() => {
        try {
            globalThis.localStorage?.setItem(STORAGE_KEY, mode)
        } catch {}
        // MaskTheme uses `cssVariables.colorSchemeSelector: 'data'`
        document.documentElement.dataset.muiColorScheme = mode
        document.documentElement.style.colorScheme = mode
    }, [mode])

    const ctx = useMemo<ModeContext>(
        () => ({ mode, setMode, toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }),
        [mode],
    )

    return (
        <ModeContext value={ctx}>
            {/* The gallery renders in the normal DOM, not the extension's shadow roots. */}
            <DisableShadowRootContext value={true}>
                <MaskThemeProvider palette={mode}>
                    <DialogStackingProvider>{children}</DialogStackingProvider>
                </MaskThemeProvider>
            </DisableShadowRootContext>
        </ModeContext>
    )
}
