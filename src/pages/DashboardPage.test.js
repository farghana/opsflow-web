import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DashboardPage from './DashboardPage.vue'

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    const wrapper = mount(DashboardPage)

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Open work orders')
  })
})
