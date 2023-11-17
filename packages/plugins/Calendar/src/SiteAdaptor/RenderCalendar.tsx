import { i18NextInstance } from '@masknet/shared-base';
import { queryClient } from "@masknet/shared-base-ui";
import { CSSVariableInjector, MaskLightTheme, MaskThemeProvider, DisableShadowRootContext } from '@masknet/theme';
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base';
import { StyledEngineProvider } from '@mui/material';
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { CalendarContent } from "./CalendarContent.js";

function useTheme() {
    return MaskLightTheme
}

export function RenderCalendar() {
  return (
    <DisableShadowRootContext.Provider value>
      <I18nextProvider i18n={i18NextInstance}>
        <StyledEngineProvider injectFirst>
          <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useTheme}>
            <QueryClientProvider client={queryClient}>
              <RootWeb3ContextProvider>
                <CSSVariableInjector />
                <CalendarContent />
              </RootWeb3ContextProvider>
            </QueryClientProvider>
          </MaskThemeProvider>
        </StyledEngineProvider>
      </I18nextProvider>
    </DisableShadowRootContext.Provider>
  )
}
