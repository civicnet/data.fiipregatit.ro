import { useEffect } from "react";
import { useRecoilSnapshot } from "recoil";

export function DebugObserver() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const snapshot = useRecoilSnapshot();
  useEffect(() => {
    console.debug("The following atoms were modified:");
    for (const node of snapshot.getNodes_UNSTABLE({
      isModified: true,
    }) as any) {
      console.debug(node.key, snapshot.getLoadable(node));
    }
  }, [snapshot]);
  return null;
}
