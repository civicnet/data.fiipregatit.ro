import { WindowWithGA } from "./WindowWithGA";

export const logPageview = (url: string) => {
  if (!("gtag" in window)) {
    return;
  }
  
  (window as WindowWithGA).gtag("config", process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
    page_path: url,
  });
};
