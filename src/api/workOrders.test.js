import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './client'
import { getTeamMembers, getWorkOrder, getWorkOrders } from './workOrders'

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('work orders API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passes list filters to the API', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [], meta: { total: 0 } } })
    await getWorkOrders({ status: 'blocked', priority: 'urgent', overdue: '1' })
    expect(api.get).toHaveBeenCalledWith('/api/work-orders', {
      params: { status: 'blocked', priority: 'urgent', overdue: '1' },
    })
  })

  it('unwraps work order detail data', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { id: 42, order_number: 'WO-0042' } } })
    await expect(getWorkOrder(42)).resolves.toMatchObject({ id: 42 })
  })

  it('loads organization team members', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [{ id: 1, name: 'Alex' }] } })
    await expect(getTeamMembers()).resolves.toHaveLength(1)
  })
})
