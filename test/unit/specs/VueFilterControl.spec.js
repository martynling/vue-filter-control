import Vue from 'vue'
import VueFilterControl from '@/components/vue-filter-control'
import Column from '@/components/column.js'
import { OperatorDefinition } from '@/components/operator.js'

import { mount } from '@vue/test-utils'
import sinon from 'sinon'

function columnId (withOptGroup = true) {
  return new Column({
    name: 'id',
    displayName: '#',
    dataType: 'number',
    optGroup: withOptGroup ? 'user' : null
  })
}

function columnEmail (withOptGroup = true) {
  return new Column({
    name: 'email',
    displayName: 'Email',
    dataType: 'string',
    optGroup: withOptGroup ? 'user' : null
  })
}

function columnPrice (withOptGroup = true) {
  return new Column({
    name: 'price',
    displayName: 'Price',
    dataType: 'number',
    optGroup: withOptGroup ? 'item' : null
  })
}

const operatorEquals = new OperatorDefinition({ key: '=' })
const operatorContains = new OperatorDefinition({ key: 'contains' })

const valueId = { key: '12', value: '12'}
const valueEmail = { key: 'wibble', value: 'wibble'}

const factory = () => {
  return mount(VueFilterControl, {
    propsData: {
      columns: [
        columnId(false),
        columnEmail(false),
        columnPrice(false)
      ],
      'active-filters': [{
        column: columnId(false),
        operator: operatorEquals,
        value: valueId
      }, {
        column: columnEmail(false),
        operator: operatorContains,
        value: valueEmail
      }]
    }
  })
}

const factoryWithOptGroups = () => {
  return mount(VueFilterControl, {
    propsData: {
      columns: [
        columnId(),
        columnEmail(),
        columnPrice()
      ],
      'active-filters': [{
        column: columnId(),
        operator: operatorEquals,
        value: valueId
      }, {
        column: columnEmail(),
        operator: operatorContains,
        value: valueEmail
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

    expect(wrapper.find('.vue-filter-control .filter-display > p').text()).toEqual('Filter by:')
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
      column: columnEmail(false),
      operator: operatorContains,
      value: valueEmail
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
    expect(filterChangedEvent[0][0][2].column).toEqual(columnPrice(false))
    expect(filterChangedEvent[0][0][2].operator).toEqual(operatorEquals)
    expect(filterChangedEvent[0][0][2].value).toEqual(valueId)
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
    expect(filterChangedEvent[0][0][2].column).toEqual(columnPrice())
    expect(filterChangedEvent[0][0][2].operator).toEqual(operatorEquals)
    expect(filterChangedEvent[0][0][2].value).toEqual(valueId)
  })

})
