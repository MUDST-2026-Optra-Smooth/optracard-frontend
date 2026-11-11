import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAuctionClock, useAuctionLive } from '../../src/hooks/useAuctionLive';
import { loadAuction, loadAuctionBids } from '../../src/api/auctions';
vi.mock('../../src/api/auctions', () => ({ loadAuction: vi.fn(), loadAuctionBids: vi.fn() }));
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });
describe('Live auction', () => {
  it('updates countdown each second and stops timers on unmount', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-11T12:00:00+07:00'));
    const {result, unmount} = renderHook(()=>useAuctionClock('2026-11-11T12:00:03'));
    expect(result.current.remaining).toBe(3); act(()=>vi.advanceTimersByTime(1000));expect(result.current.remaining).toBe(2);
    act(()=>vi.advanceTimersByTime(5000));expect(result.current.remaining).toBe(0);unmount();expect(vi.getTimerCount()).toBe(0);
  });
  it('refreshes auction and bid history after five seconds', async () => {
    vi.mocked(loadAuction).mockResolvedValue({id:1,currentPrice:100} as Awaited<ReturnType<typeof loadAuction>>);
    vi.mocked(loadAuctionBids).mockResolvedValue([]);
    const {result,unmount}=renderHook(()=>useAuctionLive(1));
    await waitFor(()=>expect(result.current.auction?.currentPrice).toBe(100));
    vi.useFakeTimers();
    // Manual refresh cancels the previous poll and starts a fresh request.
    act(()=>result.current.refresh());
    await act(async()=>{await Promise.resolve();});
    vi.mocked(loadAuction).mockResolvedValue({id:1,currentPrice:150} as Awaited<ReturnType<typeof loadAuction>>);
    await act(async()=>{await vi.advanceTimersByTimeAsync(5000);});
    expect(result.current.auction?.currentPrice).toBe(150);expect(loadAuctionBids).toHaveBeenCalledTimes(3);unmount();expect(vi.getTimerCount()).toBe(0);
  });
});
