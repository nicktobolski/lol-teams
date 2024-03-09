"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
// 1. import `NextUIProvider` component
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { createIDBPersister } from "./utils/indexedDbPersister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(new QueryClient({}));
  const persister = createIDBPersister();
  return (
    <PersistQueryClientProvider client={client} persistOptions={{ persister }}>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <MotionConfig transition={{ duration: 0.5 }}>{children}</MotionConfig>
          <ReactQueryDevtools initialIsOpen={false} />
        </NextThemesProvider>
      </NextUIProvider>
    </PersistQueryClientProvider>
  );
}
