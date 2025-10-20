import { create } from "zustand/react";

interface UpdateStore {
  uploadActive: boolean;
  setUploadActive: (value: boolean) => void;
  progress: number;
  setProgress: (value: number) => void;
}

export const useUpdateStore = create<UpdateStore>()((set) => ({
  uploadActive: false,
  setUploadActive: (value) => set(() => ({ uploadActive: value })),
  progress: 0,
  setProgress: (value) => set(() => ({ progress: value })),
}));
