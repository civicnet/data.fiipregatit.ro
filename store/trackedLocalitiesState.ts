import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const trackedLocalitiesState = atom<string[]>({
  key: "trackedLocalities",
  default: [],
  effects_UNSTABLE: [persistAtom],
});
