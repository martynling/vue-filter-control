<template>
  <div class="vue-filter-control">
    <div class="filter-display">
      <p>{{ getText('filter_label') }}</p>
      <ul class="active-filters" role="alert">
        <vue-filter-list-item v-for="(activeFilter) in populatedActiveFilters"
                              v-bind:key="activeFilter.id"
                              v-bind:filter=activeFilter
                              v-on:filter-removed="removeFilter"
                              v-on:filter-edited="editFilter"
        ></vue-filter-list-item>
      </ul>
      <button class="add-filter"
            v-show="!showNewFilter"
            v-on:click="addNewFilter"
      >
        <span class="glyphicon glyphicon-plus-sign"
              aria-hidden="true"
        ></span>
        {{ getText('add_filter') }}
      </button>
    </div>
    <div v-if="showNewFilter"
         class="add-new-filter form-inline"
    >
      <form v-on:submit.prevent>
        <div class="form-group" id="select-column">
          <label v-if="!hasOptGroups" class="screen-reader-only" for="select-column-simple">{{ getText('select_column') }}</label>
          <select v-if="!hasOptGroups"
                  v-on:change="columnSelected"
                  class="form-control select-column"
                  v-model="columnName"
                  id="select-column-simple"
                  ref="selectColumn"
          >
            <option value="">
              {{ getText('select_column_blank') }}
            </option>
            <option v-for="column in filterableColumns"
                    v-bind:key="column.name"
                    v-bind:value="column.name"
            >
              {{ column.displayName }}
            </option>
          </select>
          <label v-if="hasOptGroups" class="screen-reader-only" for="select-column-opt-group">{{ getText('select_column') }}</label>
          <select v-if="hasOptGroups"
                  v-on:change="columnSelected"
                  class="form-control select-column"
                  v-model="columnName"
                  id="select-column-opt-group"
                  ref="selectColumn"
          >
            <option value="">
              {{ getText('select_column_blank') }}
            </option>
            <optgroup v-for="group in optGroups"
                      v-bind:key="group.value"
                      v-bind:label="group.label"
            >
              <option v-for="column in getFilterableOptGroupColumns(group)"
                      v-bind:key="column.id"
                      v-bind:value="column.name"
              >
                {{ column.displayName }}
              </option>
            </optgroup>
          </select>
        </div>
        <div class="form-group"
             v-show="showOperatorOptions"
        >
          <label class="screen-reader-only" for="select-operator">{{ getText('select_operator') }}</label>
          <select v-on:change="operatorSelected"
                  class="form-control select-operator"
                  v-model="operatorKey"
                  id="select-operator"
                  ref="selectOperator"
          >
            <option value="">
              {{ getText('select_operator_blank') }}
            </option>
            <option v-for="(value, key) in operatorOptions"
                    v-bind:key="key"
                    v-bind:value="key"
            >
              {{ value.displayText }}
            </option>
          </select>
        </div>
        <div class="form-group"
             v-if="showFilterValueInput"
        >
          <label class="screen-reader-only" for="value-text">{{ getText('filter_by') }}</label>
          <input v-if="freetextQuery"
              type="text"
              class="form-control input-value"
              v-model="filterValue"
              v-on:keyup.enter="setNewFilter"
              id="value-text"
              ref="inputValue"
          />
          <label v-if="selectQuery" class="screen-reader-only" for="value-select">{{ getText('filter_by') }}</label>
          <select v-if="selectQuery"
                     v-model="filterValue"
                     :settings="selectizeSettings"
                     class="form-control"
                     v-on:keyup.enter="setNewFilter"
                     id="value-select"
                     ref="inputValue"
          >
            <option value="">{{ getText('select_value_blank') }}</option>
            <option v-for="option in filterValueOptions"
                    v-bind:key="option.key"
                    v-bind:value="option.key"
            >
              {{ option.value }}
            </option>
          </select>
          <label v-if="multiSelectQuery" class="screen-reader-only" for="value-select-multi">{{ getText('filter_by') }}</label>
          <selectize v-if="multiSelectQuery"
              v-model="filterValue"
              :settings="selectizeSettings"
              class="form-control"
              v-on:keyup.enter="setNewFilter"
              id="value-select-multi"
              ref="inputValue"
          >
            <option value="">{{ getText('select_value_blank') }}</option>
            <option v-for="option in filterValueOptions"
                    v-bind:key="option.key"
                    v-bind:value="option.key"
            >
              {{ option.value }}
            </option>
          </selectize>
          <div v-if="dateQuery">
            <label v-if="supportsHtml5Date" class="screen-reader-only" for="value-date">{{ getText('filter_by') }}</label>
            <input v-if="supportsHtml5Date"
                   type="date" class="form-control"
                   v-model="filterValue"
                   v-on:keyup.enter="setNewFilter"
                   id="value-date"
                   ref="inputValue"
            />
            <div v-else>
              <label class="screen-reader-only" for="value-date-basic">{{ getText('filter_by') }}</label>
              <input type="text"
                     class="form-control"
                     v-model="filterValue"
                     placeholder="YYYY-MM-DD"
                     v-on:keyup.enter="setNewFilter"
                     id="value-date-basic"
                     ref="inputValue"
              />
            </div>
          </div>
        </div>
        <div class="form-group">
          <button :disabled="!showFilterValueInput"
                  v-on:click="setNewFilter"
                  class="btn btn-sm btn-primary set-filter"
          >
            {{ getText('set_filter') }}
          </button>
          <button v-on:click="cancelNewFilter"
                  class="btn btn-sm btn-default cancel-filter"
          >
            {{ getText('cancel') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script type="text/babel">
import Selectize from 'vue2-selectize'
import VueFilterListItem from './vue-filter-list-item.vue'
import { DataTypeOperators } from './operator.js'

/* global Modernizr */
export default {
  components: {
    Selectize,
    VueFilterListItem
  },
  props: {
    activeFilters: {
      type: Array,
      required: true
    },
    columns: {
      required: true
    },
    optGroups: {
      type: Array,
      default: function () { return [] }
    },
    locale: {
      default: 'en'
    }
  },

  data: function () {
    return {
      editingFilter: null,
      newFilter: false,
      showOperatorOptions: false,
      showFilterValueInput: false,
      column: null,
      columnName: '',
      freetextQuery: false,
      selectQuery: false,
      multiSelectQuery: false,
      dateQuery: false,
      operator: null,
      operatorKey: '',
      filterValue: '',
      selectizeSettings: {
        valueField: 'key',
        labelField: 'value',
        searchField: 'value',
        maxItems: 1,
        plugins: ['remove_button']
      },
      locales: {
        en: {
          filter_label: 'Filter by:',
          add_filter: 'Add Filter',
          column: 'Column',
          operator: 'Operator',
          select_column: 'Choose Filter Column',
          select_column_blank: '-- Select --',
          select_operator: 'Choose Filter Operator',
          select_operator_blank: '-- Select --',
          select_value: 'Choose Filter Value',
          select_values: 'Choose Filter Values',
          select_value_blank: '-- Select --',
          filter_by: 'Filter by',
          set_filter: 'Set Filter',
          cancel: 'Cancel',
          equals: 'equals',
          not_equals: 'not equals',
          begins_with: 'begins with',
          contains: 'contains',
          less_than: 'less than',
          less_than_or_equals: 'less than or equals',
          greater_than: 'greater than',
          greater_than_or_equals: 'greater than or equals',
          before: 'before',
          before_or_on: 'before or on',
          after: 'after',
          after_or_on: 'after or on',
          is_one_of: 'is one of',
          column_missing: '-- Column Missing --',
          operator_missing: '-- Operator Missing --',
          is: 'is',
          is_not: 'is not'
        },
        fr: {
          filter_label: 'Filtre par:',
          add_filter: 'Ajouter un filtre',
          column: 'Colonne',
          operator: 'Opérateur',
          select_column: 'Sélectionner Colonne',
          select_column_blank: '-- Sélectionner --',
          select_operator: 'Sélectionner Opérateur',
          select_operator_blank: '-- Sélectionner --',
          select_value_blank: '-- Sélectionner --',
          filter_by: 'Filtrer par',
          set_filter: 'Créer un filtre',
          cancel: 'Annuler',
          equals: 'égale',
          not_equals: 'n\'égale pas',
          begins_with: 'commence par',
          contains: 'contient',
          less_than: 'inférieur à',
          less_than_or_equals: 'inférieur ou égal à',
          greater_than: 'supérieur à',
          greater_than_or_equals: 'supérieur ou égal à',
          before: 'avant',
          before_or_on: 'avant ou au ',
          after: 'après',
          after_or_on: 'après ou au',
          is_one_of: 'est l\'un de',
          column_missing: '-- Colonne absente --',
          operator_missing: '-- Opérateur absent --',
          is: 'est',
          is_not: 'n\'est pas'
        },
        pt: {
          filter_label: 'Filtro por:',
          add_filter: 'Adicionar Filtro',
          column: 'Coluna',
          operator: 'Operador',
          select_column_blank: '-- Seleccionar --',
          select_operator_blank: '-- Seleccionar --',
          select_value_blank: '-- Seleccionar --',
          filter_by: 'Filtrar por',
          set_filter: 'Definir Filtro',
          cancel: 'Cancelar',
          equals: 'igual a',
          not_equals: 'não é igual a',
          begins_with: 'começa por',
          contains: 'contém',
          less_than: 'inferior a',
          less_than_or_equals: 'inferior ou igual a',
          greater_than: 'superior a',
          greater_than_or_equals: 'superior ou igual a',
          before: 'antes',
          before_or_on: 'antes de ou em',
          after: 'depois',
          after_or_on: 'depois ou em',
          is_one_of: 'é um de',
          column_missing: '-- Coluna em Falta --',
          operator_missing: '-- Operador em Falta --',
          is: 'é',
          is_not: 'não é'
        }
      }
    }
  },

  computed: {
    hasOptGroups () {
      return this.optGroups.length > 0
    },

    operatorOptions () {
      return this.column ? this.getOperatorsForColumn(this.column) : {}
    },

    filterValueOptions () {
      return this.column ? this.column.options : {}
    },

    filterableColumns () {
      return this.columns.filter(function (column) {
        return !column.notFilterable
      })
    },

    populatedActiveFilters () {
      return this.activeFilters.map(function (item) {
        let column = this.columns.find(function (col) {
          return col.name === item.column
        })
        return {
          column: column,
          operator: this.getOperatorFromColumnAndKey(column, item.operator),
          value: this.getFilterValueObject(column, item.value)
        }
      }, this)
    },

    showNewFilter () {
      return this.newFilter || this.activeFilters.length === 0
    },

    supportsHtml5Date () {
      if (typeof Modernizr === 'undefined') {
        console.log('Vue-Filter-Control warning: Modernizr is required to switch to alternative input for browsers not supporting date input.')
        return true
      }
      return Modernizr.inputtypes.date
    }
  },

  methods: {
    activateFilterValueInput () {
      this.freetextQuery = false
      this.dateQuery = false
      this.selectQuery = false
      this.multiSelectQuery = false

      if (this.column.maxItems) {
        if (this.operator && this.operator.multiSelect) this.selectizeSettings.maxItems = this.column.maxItems
        else this.selectizeSettings.maxItems = 1
      } else {
        this.selectizeSettings.maxItems = 1
      }

      switch (this.column.dataType) {
        case 'string':
          this.freetextQuery = true
          break
        case 'number':
          this.freetextQuery = true
          break
        case 'date':
        case 'datetime':
          this.dateQuery = true
          break
        case 'choice':
          if (this.column && this.column.maxItems > 1 && this.operator && this.operator.multiSelect) {
            this.selectizeSettings.maxItems = this.column.maxItems
            this.multiSelectQuery = true
          } else {
            this.selectQuery = true
          }
          break
      }
      return true
    },

    addNewFilter () {
      this.newFilter = true
      this.$nextTick(() => this.$refs.selectColumn.focus())
    },

    cancelNewFilter () {
      this.newFilter = false
      if (this.editingFilter !== null) {
        this.resetNewFilterData()
      }
    },

    columnSelected () {
      this.column = this.columns.find(function (column) {
        return column.name === this.columnName
      }, this) // this.columnName is bound to the column select
      this.operatorKey = ''
      this.filterValue = ''
      this.showFilterValueInput = false // Unload existing input(s)

      if (!this.column) {
        alert('Column configuration error')
      }
      this.showOperatorOptions = true
      this.$nextTick(() => this.$refs.selectOperator.focus())
    },

    // `filter` is passed  from vue-filter-list-item and is from populatedActiveFilters
    editFilter (filter) {
      this.editingFilter = filter
      this.newFilter = true
      this.column = filter.column
      this.columnName = this.column.name // Bound to column select
      this.operator = filter.operator
      this.operatorKey = this.operator.key // Bound to operator select
      this.showOperatorOptions = true
      this.operatorSelected(false)
      this.$nextTick(function () {
        // this code is in next tick in case the filter selection is a dropdown list whose contents are dependent
        // on the operator selected
        this.filterValue = this.getFilterValueObjectKeys(filter.value)
      })
    },

    getFilterableOptGroupColumns (optGroup) {
      return this.columns.filter(function (column) {
        return !column.notFilterable && column.optGroup === optGroup.value
      })
    },

    getFilterValueObject (column, filterValue) {
      if (Array.isArray(filterValue)) { // array of keys
        return filterValue.map(function (item) {
          return this.getSelectedOptionFromColumnAndKey(column, item)
        }, this)
      } else {
        let value = this.getSelectedOptionFromColumnAndKey(column, filterValue)
        if (!value) {
          value = { key: filterValue, value: filterValue }
        }
        return value
      }
    },

    getFilterValueObjectKeys (filterValueObject) {
      if (Array.isArray(filterValueObject)) {
        return filterValueObject.map((item) => {
          return item.key
        })
      }
      return filterValueObject.key
    },

    getOperatorFromColumnAndKey (column, key) {
      let operators = this.getOperatorsForColumn(column)
      return operators ? operators[key] : null
    },

    getOperatorsForColumn (column) {
      let operators = DataTypeOperators[column.dataType]
      if (!operators || !operators.length) return {}

      // Remove any operators that are not relevant to the column
      const relevantOperators = operators.filter(function (operator) {
        // multiSelect operators are not relevant if the column only allows one item to be selected
        return !(column.dataType === 'choice' && operator.multiSelect && column.maxItems === 1)
      })

      const translatedOperators = relevantOperators.map(function (item) {
        item.displayText = this.getText(item.displayText)
        return item
      }, this)

      // Reformat the array into key => item structure
      return translatedOperators.reduce((obj, item) => {
        obj[item.key] = item
        return obj
      }, {})
    },

    getSelectedOptionFromColumnAndKey (column, optionKey) {
      if (column.options) {
        return column.options.find(function (option) {
          return option.key == optionKey // eslint-disable-line eqeqeq
        })
      }
      return null
    },

    areFilterValuesEqual (filterValue1, filterValue2) {
      return (
        Array.isArray(filterValue1)
          ? (filterValue2.length === filterValue1.length && filterValue2.every((v, i) => v === filterValue1[i]))
          : filterValue2 === filterValue1
      )
    },

    operatorSelected (resetValue = true) {
      this.operator = this.getOperatorFromColumnAndKey(this.column, this.operatorKey)
      this.showFilterValueInput = false // Force a reload of input based on operator
      if (resetValue) this.filterValue = ''
      this.activateFilterValueInput()
      this.$nextTick(function () {
        // Allow a tick for the input to be removed and then re-create it
        this.showFilterValueInput = true
        this.$nextTick(() => this.$refs.inputValue.focus())
      })
    },

    removeFilter (populatedActiveFilter) {
      let index = this.activeFilters.findIndex(function (item) {
        let filterValue = this.getFilterValueObjectKeys(populatedActiveFilter.value)
        return item.column === populatedActiveFilter.column.name &&
          item.operator === populatedActiveFilter.operator.key &&
          this.areFilterValuesEqual(filterValue, item.value)
      }, this)
      if (index !== -1) {
        this.activeFilters.splice(index, 1)
        this.$emit('filter-changed', this.activeFilters)
      }
    },

    resetNewFilterData () {
      this.editingFilter = null
      this.newFilter = false
      this.showOperatorOptions = false
      this.showFilterValueInput = false
      this.column = null
      this.columnName = ''
      this.operator = null
      this.operatorKey = ''
      this.filterValue = ''
    },

    setNewFilter () {
      let newFilter = {
        column: this.column.name,
        operator: this.operator.key,
        value: this.getFilterValueObjectKeys(this.getFilterValueObject(this.column, this.filterValue))
      }

      if (this.editingFilter === null) {
        this.activeFilters.push(newFilter)
      } else {
        let index = this.activeFilters.indexOf(this.editingFilter)
        this.activeFilters.splice(index, 1, newFilter)
      }
      this.resetNewFilterData()
      this.$emit('filter-changed', this.activeFilters)
    },

    getText (id) {
      if (!this.locales[this.locale][id]) {
        if (!this.locales['en'][id]) {
          return id
        }
        return this.locales['en'][id]
      }
      return this.locales[this.locale][id]
    }
  }
}
</script>

<style lang="scss" scoped>
  .screen-reader-only {
    position: absolute;
    height: 1px;
    width: 1px;
    clip: rect(1px,1px,1px,1px);
    clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
    -webkit-clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
    overflow: hidden !important;
  }

  .vue-filter-control {
    font-size: 14px;
  }

  .vue-filter-control .filter-display p {
    float: left;
  }

  .vue-filter-control .active-filters {
    float: left;
    margin-left: 4px;
    padding-left: 0;
  }

  .add-filter {
    color: #fff;
    height: 30px;
    line-height: 30px;
    position: relative;
    border-radius: 3px;
    background: #337ab7;
    margin-right: 4px;
    padding: 0 8px 0;
    border: none;
  }

  .add-filter:hover {
    background: #000;
  }

  .add-filter .glyphicon {
    top: 3px;
  }

  .add-new-filter {
    width: 100%;
    clear: left;
  }

  .selectize-control {
    min-width: 200px;
    margin-top: 7px!important;
  }
</style>
