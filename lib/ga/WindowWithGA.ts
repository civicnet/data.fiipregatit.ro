export type WindowWithGA = typeof window & {
    gtag: (...args: unknown[]) => void; 
}
