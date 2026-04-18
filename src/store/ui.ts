import { create } from 'zustand';

interface GlobeState {
  /** 현재 카메라가 향하는 위치 */
  focusLat: number | null;
  focusLng: number | null;
  setFocus: (lat: number, lng: number) => void;
  clearFocus: () => void;
}

interface UIState {
  globe: GlobeState;
  isCreatePinOpen: boolean;
  setCreatePinOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  globe: {
    focusLat: null,
    focusLng: null,
    setFocus: (lat, lng) => set((s) => ({ globe: { ...s.globe, focusLat: lat, focusLng: lng } })),
    clearFocus: () => set((s) => ({ globe: { ...s.globe, focusLat: null, focusLng: null } })),
  },
  isCreatePinOpen: false,
  setCreatePinOpen: (open) => set({ isCreatePinOpen: open }),
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}));
