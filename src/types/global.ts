declare global {
  interface Window {
    gtag?: (
      event: string,
      eventName: string,
      payload: Record<string, string | number | boolean>,
    ) => void;
  }
}

export {}