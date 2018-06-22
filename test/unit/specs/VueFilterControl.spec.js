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

function columnFavoriteThings (withOptGroup = true) {
  return new Column({
    name: 'things',
    displayName: 'Things',
    dataType: 'choice',
    options: [
      { key: 1, value: 'Thing 1' },
      { key: 2, value: 'Thing 2' },
      { key: 3, value: 'Thing 3' },
      { key: 4, value: 'Thing 4' },
      { key: 5, value: 'Thing 5' },
      { key: 6, value: 'Thing 6' }
    ],
    maxItems: 3,
    optGroup: withOptGroup ? 'item' : null
  })
}

const operatorEquals = new OperatorDefinition({ key: '=' })
const operatorContains = new OperatorDefinition({ key: 'contains' })
const operatorIsOneOf = new OperatorDefinition({ key: 'in', displayText: 'is_one_of' })

const valueId = { key: '12', value: '12'}
const valueEmail = { key: 'wibble', value: 'wibble'}
const valueFavoriteThings = [
  { key: 1, value: 'Thing 1'},
  { key: 3, value: 'Thing 3'},
  { key: 6, value: 'Thing 6'}
]

const factory = () => {
  return mount(VueFilterControl, {
    propsData: {
      columns: [
        columnId(false),
        columnEmail(false),
        columnPrice(false)
      ],
      'active-filters': [{
        column: columnId(false).name,
        operator: operatorEquals.key,
        value: valueId.key
      }, {
        column: columnEmail(false).name,
        operator: operatorContains.key,
        value: valueEmail.key
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
        column: columnId().name,
        operator: operatorEquals.key,
        value: valueId.key
      }, {
        column: columnEmail().name,
        operator: operatorContains.key,
        value: valueEmail.key
      }],
      optGroups: [
        {value: 'user', label: 'User'},
        {value: 'item', label: 'Purchased Item'}
      ]
    }
  })
}

const factoryWithIsOneOf = () => {
  return mount(VueFilterControl, {
    propsData: {
      columns: [
        columnId(),
        columnEmail(),
        columnPrice(),
        columnFavoriteThings()
      ],
      'active-filters': [{
        column: columnId().name,
        operator: operatorEquals.key,
        value: valueId.key
      }, {
        column: columnEmail().name,
        operator: operatorContains.key,
        value: valueEmail.key
      }, {
        column: columnFavoriteThings().name,
        operator: operatorIsOneOf.key,
        value: valueFavoriteThings.map((item) => {
          return item.key
        })
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
    expect(filterChangedEvent[0][0].length).toBe(1)
    expect(filterChangedEvent[0][0]).toEqual([{
      column: columnEmail(false).name,
      operator: operatorContains.key,
      value: valueEmail.key
    }])
  })

  it('should emit filterChanged if a multiValue choice activeFilter is deleted', async () => {
    let wrapper = factoryWithIsOneOf()

    // Delete the multiValue choice active filter
    wrapper.find('button.filter-remove-things').trigger('click')
    await wrapper.vm.$nextTick()

    let filterChangedEvent = wrapper.emitted()['filter-changed']
    expect(filterChangedEvent).toBeTruthy()
    expect(filterChangedEvent[0][0].length).toBe(2)
    expect(filterChangedEvent[0][0][0].column).toBe(columnId().name)
    expect(filterChangedEvent[0][0][1].column).toBe(columnEmail().name)
    expect(wrapper.vm.$props.activeFilters.length).toBe(2)
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
    expect(filterChangedEvent[0][0].length).toBe(3)
    expect(filterChangedEvent[0][0][2].column).toBe(columnPrice(false).name)
    expect(filterChangedEvent[0][0][2].operator).toBe(operatorEquals.key)
    expect(filterChangedEvent[0][0][2].value).toBe(valueId.key)
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
    expect(filterChangedEvent[0][0].length).toBe(3)
    expect(filterChangedEvent[0][0][2].column).toBe(columnPrice().name)
    expect(filterChangedEvent[0][0][2].operator).toBe(operatorEquals.key)
    expect(filterChangedEvent[0][0][2].value).toBe(valueId.key)
  })

  it('displays translations for the operators', async () => {
    let wrapper = factoryWithIsOneOf()
    const things = wrapper.find('.filter-edit-' + columnFavoriteThings().name).text()
    expect(things).toContain('is one of')
    expect(things).toContain('Thing 1, Thing 3, Thing 6')
  })
})
