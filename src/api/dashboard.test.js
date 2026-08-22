import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './client'
import { getDashboardSummary } from './dashboard'

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('dashboard API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the dashboard summary endpoint', async () => {
    const payload = {
      metrics: { open: 3, overdue: 1, high_priority: 2, completed_last_7_days: 4 },
      recent_work_orders: [],
    }

    api.get.mockResolvedValueOnce({ data: payload })

    await expect(getDashboardSummary()).resolves.toEqual(payload)
    expect(api.get).toHaveBeenCalledWith('/api/dashboard/summary')
  })
})
