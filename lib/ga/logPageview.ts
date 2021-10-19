type WindowWithGA = typeof window & {
    gtag: (...args: unknown[]) => void; 
}

export const logPageview = (url: string) => {
  (window as WindowWithGA).gtag("config", process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
    page_path: url,
  });
};
