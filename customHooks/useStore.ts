'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type State = {
  filters: any[];
  openCancelRequest: boolean;
  selectedMtn?: string;
  jdSelectedMtn?: string;
  selectedMdn?: string;
  accountNumber?: string;
  sortBy?: string;
  journeyType?: string;
};

interface Store {
  store: State;
  reset: () => void;
  setStore: (partialState: Partial<State>) => void;
}

const initialState: State = {
  filters: [],
  openCancelRequest: false,
  sortBy: 'lastUpdateDateTime',
  selectedMtn: '',
  jdSelectedMtn: '',
};

const store = <T>(set: any) => ({
  store: initialState,
  setStore: (partialState: Partial<T>) =>
    set(
      (state: Store) => ({ store: { ...state.store, ...partialState } }),
      false,
      `@update/${Object.keys(partialState).join(',')}`
    ),
  reset: () =>
    set((state: Store) => ({ ...state, initialState }), false, '@reset'),
});

const useStore = create<Store>(
  // @ts-expect-error
  devtools(store, {
    name: 'srvc-cntl-store',
  })
);

export default useStore;
