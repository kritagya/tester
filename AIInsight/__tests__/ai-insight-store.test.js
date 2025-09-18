import { getIsNetworkInsight, getIsDeviceInsight, getIsAIInsight, useAIInsightStore } from '../ai-insight-store';

describe('ai-insight-store selectors', () => {
  it('getIsNetworkInsight returns true for network intent', () => {
    expect(getIsNetworkInsight('IN11512')).toBe(true);
    expect(getIsNetworkInsight('not-in-list')).toBe(false);
  });

  it('getIsDeviceInsight returns true for device intent', () => {
    expect(getIsDeviceInsight('IN0120')).toBe(true);
    expect(getIsDeviceInsight('not-in-list')).toBe(false);
  });

  it('getIsAIInsight returns true for dropped call or device intent', () => {
    expect(getIsAIInsight('IN11512')).toBe(true);
    expect(getIsAIInsight('IN0120')).toBe(true);
    expect(getIsAIInsight('not-in-list')).toBe(false);
  });
});

describe('ai-insight-store Zustand store', () => {
  beforeEach(() => {
    useAIInsightStore.getState().reset();
  });

  it('setStore updates state and derived values', () => {
    useAIInsightStore.getState().setStore({ intentId: 'IN0120' });
    const state = useAIInsightStore.getState().store;
    expect(state.intentId).toBe('IN0120');
    expect(state.isDeviceInsight).toBe(true);
    expect(state.isAIInsight).toBe(true);
    expect(state.isNetworkInsight).toBe(false);
  });

});