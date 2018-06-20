import Vue from 'vue'
import VueFilterControl from '@/components/vue-filter-control'
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

const factory = () => {
  return mount(VueFilterControl, {
    propsData: {
      columns: [{
        name: 'id',
        displayName: '#',
        dataType: 'number'
      }, {
        name: 'email',
        displayName: 'Email',
        dataType: 'string'
      }, {
        name: 'price',
        displayName: 'Price',
        dataType: 'number'
      }],
      'active-filters': [{
        column: 'id',
        operator: '=',
        value: '1'
      }, {
        column: 'email',
        operator: 'contains',
        value: 'wibble'
      }]
    }
  })
}

const factoryWithOptGroups = () => {
  return mount(VueFilterControl, {
    propsData: {
      columns: [{
        name: 'id',
        displayName: '#',
        dataType: 'number',
        optGroup: 'user'
      }, {
        name: 'email',
        displayName: 'Email',
        dataType: 'string',
        optGroup: 'user'
      }, {
        name: 'price',
        displayName: 'Price',
        dataType: 'number',
        optGroup: 'item'
      }],
      'active-filters': [{
        column: 'id',
        operator: '=',
        value: '1'
      }, {
        column: 'email',
        operator: 'contains',
        value: 'wibble'
      }],
      optGroups: [
        {value: 'user', label: 'User'},
        {value: 'item', label: 'Purchased Item'}
      ]
    }
  })
}

describe('VueFilterControl', () => {
  it('should render correct contents', () => {
    let wrapper = factory()

    expect(wrapper.find('.vue-filter-control .filter-display > p').text()).toEqual('Filter:')
  })

  it('should render passed in activeFilters', () => {
    let wrapper = factory()
    expect(wrapper.find('.active-filters').exists()).toBeTruthy()
    expect(wrapper.findAll('.filter-box').length).toEqual(2)
  })

  it('should trigger removeFilter method if an activeFilter is deleted', () => {
    const stub = sinon.stub()
    let wrapper = factory()
    wrapper.setMethods({
      removeFilter: stub
    })
    // Delete one of the active filters
    let removeButton = wrapper.find('button.filter-remove')
    expect(removeButton.is('button')).toBe(true)
    removeButton.trigger('click')
    expect(stub.called).toBe(true)
  })

  it('should emit filterChanged if an activeFilter is deleted', () => {
    let wrapper = factory()
    // Delete one of the active filters
    let removeButton = wrapper.find('button.filter-remove')
    expect(removeButton.is('button')).toBe(true)
    removeButton.trigger('click')

    let filterChangedEvent = wrapper.emitted()['filter-changed']
    expect(filterChangedEvent).toBeTruthy()
    expect(filterChangedEvent[0][0].length).toEqual(1)
    expect(filterChangedEvent[0][0]).toEqual([{
      column: 'email',
      operator: 'contains',
      value: 'wibble'
    }])
  })

  it('can add a new filter which should emit filterChanged', async () => {
    let wrapper = factory()

    expect(wrapper.find('.add-filter').isVisible()).toBe(true)
    wrapper.find('.add-filter').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.newFilter).toBe(true)
    expect(wrapper.find('.add-filter').isVisible()).toBe(false)
    expect(wrapper.find('.select-column').isVisible()).toBe(true)
    // Select column and set to price
    let options = wrapper.find('.select-column').findAll('option')
    options.at(3).setSelected()

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.columnName).toEqual('price')

    expect(wrapper.find('.select-operator').isVisible()).toBe(true)
    let opOptions = wrapper.find('.select-operator').findAll('option')
    opOptions.at(1).setSelected()

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.operatorKey).toEqual('=')
    let inputValue = wrapper.find('.input-value')
    expect(inputValue.isVisible()).toBe(true)
    inputValue.setValue('12')

    await wrapper.vm.$nextTick()
    expect(wrapper.find('button.set-filter').isVisible()).toBe(true)
    wrapper.find('button.set-filter').trigger('click')

    await wrapper.vm.$nextTick()
    let filterChangedEvent = wrapper.emitted()['filter-changed']
    expect(filterChangedEvent).toBeTruthy()
    expect(filterChangedEvent[0][0].length).toEqual(3)
    expect(filterChangedEvent[0][0][2]).toEqual({
      column: 'price',
      operator: '=',
      value: '12'
    })
  })

  it('can add a new filter using optgroups which should emit filterChanged', async () => {
    let wrapper = factoryWithOptGroups()

    expect(wrapper.find('.add-filter').isVisible()).toBe(true)
    wrapper.find('.add-filter').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.newFilter).toBe(true)
    expect(wrapper.find('.add-filter').isVisible()).toBe(false)
    expect(wrapper.find('.select-column').isVisible()).toBe(true)
    // Select column and set to price
    let options = wrapper.find('.select-column').findAll('option')
    options.at(3).setSelected()

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.columnName).toEqual('price')

    expect(wrapper.find('.select-operator').isVisible()).toBe(true)
    let opOptions = wrapper.find('.select-operator').findAll('option')
    opOptions.at(1).setSelected()

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.operatorKey).toEqual('=')
    let inputValue = wrapper.find('.input-value')
    expect(inputValue.isVisible()).toBe(true)
    inputValue.setValue('12')

    await wrapper.vm.$nextTick()
    expect(wrapper.find('button.set-filter').isVisible()).toBe(true)
    wrapper.find('button.set-filter').trigger('click')

    await wrapper.vm.$nextTick()
    let filterChangedEvent = wrapper.emitted()['filter-changed']
    expect(filterChangedEvent).toBeTruthy()
    expect(filterChangedEvent[0][0].length).toEqual(3)
    expect(filterChangedEvent[0][0][2]).toEqual({
      column: 'price',
      operator: '=',
      value: '12'
    })
  })

})
