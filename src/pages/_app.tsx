// src/pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import "@/components/roster/Calender.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Roster Planner</title>
      </Head>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
