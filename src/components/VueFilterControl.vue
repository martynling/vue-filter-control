<template>
  <div class="vue-filter-control">
    <div class="filter-display">
      <p>{{ getText('filter_label') }}</p>
      <div class="active-filters">
        <a v-for="(activeFilter, key) in activeFilters"
           v-bind:key="activeFilter.id"
           class="filter-box"
        >
          <span class="filter-text clickable"
                v-on:click="editFilter(key)"
                aria-label="Edit"
          >
          {{ getColumnDisplayName(activeFilter.column) }}
          {{ getOperatorDisplayText(activeFilter.column, activeFilter.operator) }}
          {{ getFilterValueDisplayText(activeFilter.column, activeFilter.value) }}
          </span>
          <span class="filter-remove"
                v-on:click="removeFilter(activeFilter)"
                aria-hidden="true"
                aria-label="Remove">
            <span class="glyphicon glyphicon-remove"></span>
          </span>
        </a>
      </div>
      <p><a class="add-filter clickable"
            v-show="!newFilter"
            v-on:click="addNewFilter"
      >
        <span class="glyphicon glyphicon-plus-sign"
              aria-hidden="true"
        ></span>
        {{ getText('add_filter') }}
      </a></p>
    </div>
    <div v-if="newFilter"
         class="add-new-filter form-inline">
      <div class="form-group">
        <label class="sr-only">{{ getText('column') }}</label>
        <select v-if="!hasOptGroups"
                v-on:change="columnSelected"
                class="form-control"
                v-model="columnName"
        >
          <option value="">
            {{ getText('select_column') }}
          </option>
          <option v-for="column in filterableColumns"
                  v-bind:key="column.id"
                  v-bind:value="column.name"
          >
            {{ column.displayName }}
          </option>
        </select>
        <select v-if="hasOptGroups"
                v-on:change="columnSelected"
                class="form-control"
                v-model="columnName"
        >
          <option value="">
            {{ getText('select_column') }}
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
        <label class="sr-only">{{ getText('operator') }}</label>
        <select v-on:change="operatorSelected"
                class="form-control"
                v-model="operatorKey"
        >
          <option value="">
            {{ getText('select_operator') }}
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
        <label class="sr-only">{{ getText('filter_by') }}</label>
        <input v-if="freetextQuery"
               type="text"
               class="form-control"
               v-model="filterValue"
               v-on:keyup.enter="setNewFilter"
        />
        <selectize v-if="selectQuery"
                v-model="filterValue"
                :settings="selectizeSettings"
                class="form-control"
                v-on:keyup.enter="setNewFilter"
        >
          <option value="">{{ getText('select_value') }}</option>
          <option v-for="option in filterValueOptions"
                  v-bind:key="option.key"
                  v-bind:value="option.key"
          >
            {{ option.value }}
          </option>
        </selectize>
        <div v-if="dateQuery">
          <input v-if="supportsHtml5Date"
                 type="date" class="form-control"
                 v-model="filterValue"
                 v-on:keyup.enter="setNewFilter"
          />
          <input v-else
                 type="text"
                 class="form-control"
                 v-model="filterValue"
                 placeholder="YYYY-MM-DD"
                 v-on:keyup.enter="setNewFilter"
          />
        </div>
      </div>
      <div class="form-group">
        <button :disabled="!showFilterValueInput"
                v-on:click="setNewFilter"
                class="btn btn-sm btn-primary"
        >
          {{ getText('set_filter') }}
        </button>
        <button v-on:click="cancelNewFilter"
                class="btn btn-sm btn-default"
        >
          {{ getText('cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script type="text/babel">
  import Selectize from 'vue2-selectize'

  /* global Modernizr */
  export default {
    components: {
      Selectize
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
            filter_label: 'Filter:',
            add_filter: 'Add Filter',
            column: 'Column',
            operator: 'Operator',
            select_column: '-- Select --',
            select_operator: '-- Select --',
            select_value: '-- Select --',
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
            operator_missing: '-- Operator Missing --'
          },
          fr: {
            filter_label: 'Filtre :',
            add_filter: 'Ajouter un filtre',
            column: 'Colonne',
            operator: 'Opérateur',
            select_column: '-- Sélectionner --',
            select_operator: '-- Sélectionner --',
            select_value: '-- Sélectionner --',
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
            operator_missing: '-- Opérateur absent --'
          },
          pt: {
            filter_label: 'Filtro:',
            add_filter: 'Adicionar Filtro',
            column: 'Coluna',
            operator: 'Operador',
            select_column: '-- Seleccionar --',
            select_operator: '-- Seleccionar --',
            select_value: '-- Seleccionar --',
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
            operator_missing: '-- Operador em Falta --'
          }
        }
      }
    },

    computed: {
      hasOptGroups () {
        return this.optGroups.length > 0
      },

      operatorOptions () {
        let column = this.getColumn(this.columnName)
        return column ? this.getOperatorsForDataType(column) : {}
      },

      filterValueOptions () {
        if (this.columnName) {
          let column = this.getColumn(this.columnName)
          if (column) return column.options
        }
        return {}
      },

      filterableColumns () {
        return this.columns.filter(function (column) {
          return !column.notFilterable
        })
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

        if (!this.columnName || !this.getColumn(this.columnName)) {
          return false
        }
        let column = this.getColumn(this.columnName)
        if (column.maxItems) {
          let operator = this.getOperatorFromColumnAndKey(column, this.operatorKey)
          if (operator && operator.multiValue) this.selectizeSettings.maxItems = column.maxItems
          else this.selectizeSettings.maxItems = 1
        } else {
          this.selectizeSettings.maxItems = 1
        }

        switch (column.dataType) {
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
            this.selectQuery = true
            break
        }
        return true
      },

      addNewFilter () {
        this.newFilter = true
      },

      cancelNewFilter () {
        this.newFilter = false
        if (this.editingFilter !== null) {
          this.resetNewFilterData()
        }
      },

      columnSelected () {
        this.column = this.getColumn(this.columnName)
        this.operatorKey = ''
        this.filterValue = ''
        this.showFilterValueInput = false // Unload existing input(s)

        if (!this.column) {
          alert('Column configuration error')
        }
        this.showOperatorOptions = true
      },

      editFilter (filterKey) {
        this.editingFilter = filterKey
        this.newFilter = true
        this.columnName = this.activeFilters[filterKey].column
        this.operatorKey = this.activeFilters[filterKey].operator
        this.showOperatorOptions = true
        this.operatorSelected(false)
        this.$nextTick(function () {
          // this code is in next tick in case the filter selection is a dropdown list whose contents are dependent
          // on the operator selected
          this.filterValue = this.activeFilters[filterKey].value
        })
      },

      getColumn (columnName) {
        for (let i = 0;i < this.columns.length; i++) {
          if (this.columns[i].name === columnName) return this.columns[i]
        }
        return null
      },

      getColumnDisplayName (columnName) {
        let column = this.getColumn(columnName)
        return column ? column.displayName : this.getText('column_missing')
      },

      getFilterableOptGroupColumns (optGroup) {
        return this.columns.filter(function (column) {
          return !column.notFilterable && column.optGroup === optGroup.value
        })
      },

      getFilterValueDisplayText (columnName, filterValue) {
        let column = this.getColumn(columnName)
        let option = null
        if (!column.hasOwnProperty('maxItems') || column.maxItems === 1) {
          option = this.getSelectedOptionFromColumnAndKey(column, filterValue)
        } else { // array of keys
          let optValues = []
          option = {}
          let optionKeys = filterValue
          for (let i = 0; i < optionKeys.length; i++) {
            let opt = this.getSelectedOptionFromColumnAndKey(column, optionKeys[i])
            if (opt) optValues.push(opt.value)
          }
          option.value = optValues.join(', ')
        }
        return option ? option.value : filterValue
      },

      getOperatorDisplayText (columnName, key) {
        let column = this.getColumn(columnName)
        if (column) {
          let operator = this.getOperatorFromColumnAndKey(column, key)
          return operator ? operator.displayText : this.getText('operator_missing')
        }
        return this.getText('operator_missing')
      },

      getOperatorFromColumnAndKey (column, key) {
        let operators = this.getOperatorsForDataType(column)
        return operators ? operators[key] : null
      },

      getOperatorsForDataType (column) {
        switch (column.dataType) {
          case 'boolean':
            return {
              '=': {displayText: this.getText('equals')},
              '!=': {displayText: this.getText('not_equals')}
            }
          case 'string':
            return {
              '=': {displayText: this.getText('equals')},
              'begins': {displayText: this.getText('begins_with')},
              'contains': {displayText: this.getText('contains')}
            }
          case 'number':
            return {
              '=': {displayText: this.getText('equals')},
              '<': {displayText: this.getText('less_than')},
              '<=': {displayText: this.getText('less_than_or_equals')},
              '>': {displayText: this.getText('greater_than')},
              '>=': {displayText: this.getText('greater_than_or_equals')}
            }
          case 'date':
          case 'datetime':
            return {
              '=': {displayText: this.getText('equals')},
              '<': {displayText: this.getText('before')},
              '<=': {displayText: this.getText('before_or_on')},
              '>': {displayText: this.getText('after')},
              '>=': {displayText: this.getText('after_or_on')}
            }
          case 'choice':
            let msOptions = {
              '=': {displayText: this.getText('equals'), multiValue: false}
            }
            if (column.maxItems && column.maxItems > 1) {
              msOptions['in'] = {displayText: this.getText('is_one_of'), multiValue: true}
            }
            return msOptions
        }
        return {}
      },

      getSelectedOptionFromColumnAndKey (column, optionKey) {
        let options = column.options
        if (options) {
          for (let i = 0; i < options.length; i++) {
            if (options[i].key == optionKey) { // eslint-disable-line eqeqeq
              return options[i]
            }
          }
        }
        return null
      },

      operatorSelected (resetValue = true) {
        this.showFilterValueInput = false // Force a reload of input based on operator
        if (resetValue) this.filterValue = ''
        this.activateFilterValueInput()
        this.$nextTick(function () {
          // Allow a tick for the input to be removed and then re-create it
          this.showFilterValueInput = true
        })
      },

      removeFilter (activeFilter) {
        let index = this.activeFilters.indexOf(activeFilter)
        this.activeFilters.splice(index, 1)
        this.$emit('filter-changed', this.activeFilters)
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
          column: this.columnName,
          operator: this.operatorKey,
          value: this.filterValue
        }

        if (this.editingFilter === null) {
          this.activeFilters.push(newFilter)
        } else {
          Vue.set(this.activeFilters, this.editingFilter, newFilter)
        }
        this.resetNewFilterData()
        this.$emit('filter-changed', this.activeFilters)
      },

      getText (id) {
        if (!this.locales[this.locale][id]) {
          return this.locales['en'][id]
        }
        return this.locales[this.locale][id]
      }
    }
  }
</script>

<style lang="scss">
  .vue-filter-control {
    font-size: 14px;
  }

  .vue-filter-control .filter-display p {
    float: left;
  }

  .vue-filter-control .active-filters {
    float: left;
    margin-left: 2px;
    margin-top: -4px;
  }

  .vue-filter-control .active-filters > a.filter-box {
    padding-right: 30px;
    color: #fff;
    height: 30px;
    line-height: 30px;
    overflow: hidden;
    position: relative;
    text-decoration: none;
    border-radius: 3px;
    background: #337ab7;
    margin: 0 4px 0 0;
    display: inline-block;
  }

  .vue-filter-control .active-filters > a.filter-box > span.filter-text {
    padding: 0 8px;
    text-decoration: none;
    height: 18px;
    line-height: 18px;
    display: inline-block;
  }

  .vue-filter-control .active-filters > a.filter-box > span.filter-text:hover {
    padding: 0 8px;
    text-decoration: underline;
    cursor: pointer;
  }

  .vue-filter-control .active-filters > a.filter-box > span.filter-remove {
    padding: 0 8px 0;
    background: lighten(#337ab7, 5%);
    color: darken(#fff, 5%);
    border-radius: 0 3px 3px 0;
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
  }

  .vue-filter-control .active-filters > a.filter-box > span.filter-remove:hover {
    color: #fff;
    background: lighten(#337ab7, 10%);
    text-decoration: none;
  }

  .vue-filter-control .filter-display .add-filter {
    margin-left: 2px;
  }


  .vue-filter-control .add-new-filter {
    width: 100%;
    clear: left;
  }

  .vue-filter-control .selectize-control {
    min-width: 200px;
    margin-top: 7px!important;
  }

</style>