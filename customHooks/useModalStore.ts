'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RequestReopened, SelectedStatus } from '@/components/Chat/chatService';

type State = {
  tellUsMore: {
    isOpen: boolean;
    onSubmitRedirect?: string;
    requestDetails?: {
      requestReopened: RequestReopened;
      selectedStatus: SelectedStatus;
      journeyKey: string;
      reason: string;
    };
  };
  changeContact: {
    isOpen: boolean;
  };
  cancelRequest: {
    isOpen: boolean;
  };
  actionModal: {
    isOpen: boolean;
  };
  updateAccountNumber: Partial<{
    isOpen: boolean;
    caseId: string;
    journeyKey: string;
    content: Record<string, any>;
    relatedLines: string[];
  }>;
  updateZipCode: Partial<{
    isOpen: boolean;
    caseId: string;
    journeyKey: string;
    content: Record<string, any>;
    relatedLines: string[];
  }>;
  updateAccountPIN: Partial<{
    isOpen: boolean;
    caseId: string;
    journeyKey: string;
    content: Record<string, any>;
    relatedLines: string[];
  }>;
  updateTransferPIN: Partial<{
    isOpen: boolean;
    caseId: string;
    journeyKey: string;
    content: Record<string, any>;
    relatedLines: string[];
  }>;
};

interface Store {
  store: State;
  reset: () => void;
  setStore: (partialState: Partial<State>) => void;
}

const initialState: State = {
  tellUsMore: {
    isOpen: false,
  },
  changeContact: {
    isOpen: false,
  },
  cancelRequest: {
    isOpen: false,
  },
  actionModal: {
    isOpen: false,
  },
  updateAccountNumber: {
    isOpen: false,
  },
  updateZipCode: {
    isOpen: false,
  },
  updateAccountPIN: {
    isOpen: false,
  },
  updateTransferPIN: {
    isOpen: false,
  },
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

const useModalStore = create<Store>(
  // @ts-expect-error
  devtools(store, {
    name: 'srvc-cntl-modal-store',
  })
);

export default useModalStore;
