<template>
    <div class="vue-filter-control">
        <div class="filter-display">
            <p>Filter:</p>
            <ul class="active-filters">
                <li v-for="activeFilter in activeFilters"
                    class="active-filter">
                    <span class="filter-text">{{ getColumnDisplayName(activeFilter.column) }}
                        {{ getOperatorDisplayText(activeFilter.column, activeFilter.operator) }}
                        {{ getFilterValueDisplayText(activeFilter.column, activeFilter.value) }}
                    </span>
                    <a class="filter-remove" @click="removeFilter(activeFilter)" aria-hidden="true" aria-label="Remove">&times;</a>
                </li>
            </ul>
            <p><a v-show="!newFilter" @click="addNewFilter" class="clickable">
                <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span> Add Filter
            </a></p>
        </div>
        <div v-show="newFilter" class="add-new-filter form-inline">
            <div class="form-group">
                <label class="sr-only">Column</label>
                <select @change="columnSelected" class="form-control" v-model="columnName">
                    <option value="">-- Select --</option>
                    <option v-for="(key,value) in columns" value="{{ key }}">{{ value.displayName }}</option>
                </select>
            </div>
            <div class="form-group" v-show="showOperatorOptions">
                <label class="sr-only">Operator</label>
                <select @change="operatorSelected" class="form-control" v-model="operatorKey">
                    <option value="">-- Select --</option>
                    <option v-for="(key, value) in operatorOptions" value="{{ key }}">{{ value.displayText }}</option>
                </select>
            </div>
            <div class="form-group" v-if="showFilterValueInput">
                <label class="sr-only">Filter by</label>
                <input v-if="freetextQuery" type="text" class="form-control" v-model="filterValue" />
                <select v-if="selectQuery"
                        v-selectize="filterValue"
                        v-model="filterValue"
                        :options="filterValueOptions"
                        :settings="selectizeSettings"
                        class="form-control"
                        >
                    <option value="">-- Select --</option>
                </select>
                <div v-if="dateQuery">
                    <input v-if="supportsHtml5Date" type="date" class="form-control" v-model="filterValue" />
                    <input v-else type="text" class="form-control" v-model="filterValue" placeholder="YYYY-MM-DD"/>
                </div>
            </div>
            <div class="form-group">
                <button :disabled="!showFilterValueInput" @click="setNewFilter" class="btn btn-sm btn-primary">Set Filter</button>
                <button @click="cancelNewFilter" class="btn btn-sm">Cancel</button>
            </div>
        </div>
    </div>
</template>

<script type="text/babel">
    export default {
        props: {
            activeFilters: {
                type: Array,
                required: true,
                twoWay: true
            }, 
            columns: {
                required: true
            } 
        },

        data: function () {
            return {
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
                    maxItems: 1,
                    plugins: ['remove_button']
                }
            };
        },

        computed: {
            operatorOptions() {
                var column = this.getColumn(this.columnName)
                return column ? this.getOperatorsForDataType(column.dataType) : {}
            },
            
            filterValueOptions() {
                if (this.columnName) {
                    var column = this.getColumn(this.columnName)
                    if (column) return column.options;
                }
                return {}
            },

            supportsHtml5Date() {
                return Modernizr.inputtypes.date
            }
        },

        methods: {
            activateFilterValueInput() {
                this.freetextQuery = false
                this.dateQuery = false
                this.selectQuery = false

                if (!this.columnName || !this.getColumn(this.columnName)) {
                    return false
                }
                var column = this.getColumn(this.columnName)
                if (column.maxItems){
                    operator = this.getOperatorFromColumnAndKey(column, this.operatorKey)
                    if (operator && operator.multiValue)
                        this.selectizeSettings.maxItems = column.maxItems
                    else
                        this.selectizeSettings.maxItems = 1
                } else {
                    this.selectizeSettings.maxItems = 1
                }
                
                switch (column.dataType) {
                    case 'string':
                        this.freetextQuery = true
                        break
                    case 'integer':
                        this.freetextQuery = true
                        break
                    case 'date':
                    case 'datetime':
                        this.dateQuery = true
                        break
                    case 'multi-select':
                        this.selectQuery = true
                        break
                }
                return true
            },
            
            addNewFilter() {
                this.newFilter = true;

            },

            cancelNewFilter() {
                this.newFilter = false;
            },

            columnSelected() {
                this.column = this.getColumn(this.columnName)
                this.operatorKey = ''
                this.filterValue = ''
                this.showFilterValueInput = false // Unload existing input(s)

                if (!this.column) {
                    alert('Column configuration error')
                }
                this.showOperatorOptions = true
            },

            getColumn(columnName) {
                return this.columns[columnName] ? this.columns[columnName] : null
            },
            
            getColumnDisplayName(columnName) {
                var column = this.getColumn(columnName)
                return column ? column.displayName : '-- Missing column --'
            },

            getFilterValueDisplayText(columnName, filterValue) {
                var column = this.getColumn(columnName)
                if (!column.maxItems || column.maxItems == 1){
                    var option = this.getSelectedOptionFromColumnAndKey(column, filterValue);
                } else { //array of keys
                    var optValues = [];
                    option = {};
                    var optionKeys = filterValue.split(",");
                    for (var i=0; i<optionKeys.length;i++){
                        var opt = this.getSelectedOptionFromColumnAndKey(column, optionKeys[i]);
                        optValues.push(opt.value);
                    }
                    option.value = optValues.join(", ");
                }
                return option ? option.value : filterValue
            },

            getOperatorDisplayText(columnName, key) {
                var column = this.getColumn(columnName)
                if (column) {
                    var operator = this.getOperatorFromColumnAndKey(column, key)
                    return operator ? operator.displayText : '-- Operator missing --'
                }
                return '-- Operator missing --'
            },

            getOperatorFromColumnAndKey(column, key) {
                var operators = this.getOperatorsForDataType(column.dataType)
                return operators ? operators[key] : null
            },

            getOperatorsForDataType(dataType) {
                switch (dataType) {
                    case 'string':
                        return {
                            '=': {displayText: 'equals'},
                            'begins': {displayText: 'begins with'},
                            'contains': {displayText: 'contains'}
                        };
                    case 'integer':
                        return {
                            '=': {displayText: 'equals'},
                            '<': {displayText: 'less than'},
                            '<=': {displayText: 'less than or equals'},
                            '>': {displayText: 'greater than'},
                            '>=': {displayText: 'greater than or equals'}
                        };
                    case 'date':
                    case 'datetime':
                        return {
                            '=': {displayText: 'equals'},
                            '<': {displayText: 'before'},
                            '<=': {displayText: 'before or equals'},
                            '>': {displayText: 'after'},
                            '>=': {displayText: 'after or equals'}
                        };
                    case 'multi-select':
                        return {
                            '=': {displayText: 'equals', multiValue: false},
                            'in': {displayText: 'is one of', multiValue: true}
                        };
                }
                return {};
            },

            getSelectedOptionFromColumnAndKey(column, optionKey) {
                var options = column.options;
                return options ? options[optionKey] : null
            },
            
            operatorSelected() {
                this.showFilterValueInput = false // Force a reload of input based on operator
                this.filterValue = '';
                this.activateFilterValueInput()
                this.$nextTick(function () {
                    // Allow a tick for the input to be removed and then re-create it
                    this.showFilterValueInput = true;
                });
            },

            removeFilter(activeFilter) {
                this.activeFilters.$remove(activeFilter);
                this.$dispatch('filter-changed');
            },

            resetNewFilterData() {
                this.newFilter = false;
                this.showOperatorOptions = false;
                this.showFilterValueInput = false;
                this.column = null;
                this.columnName = '';
                this.operator = null;
                this.operatorKey = '';
                this.filterValue = '';
            },

            setNewFilter() {
                this.activeFilters.push({
                    column: this.columnName,
                    operator: this.operatorKey,
                    value: this.filterValue
                });
                this.$dispatch('filter-changed');
                this.resetNewFilterData();
            }

        }
    }
</script>

<style lang="scss">
    .vue-filter-control .filter-display p {
        float: left;
    }

    .vue-filter-control ul {
        float: left;
        padding-left: 4px;
        margin-top: -4px;
    }
    .vue-filter-control ul > li {
        display: inline-block;
        margin: 0 8px 6px 0;
        border: solid 1px grey;
    }

    .vue-filter-control ul > li > .filter-text {
        padding: 5px 8px 4px;
        border-right: solid 1px grey;
    }

    .vue-filter-control ul > li > a {
        padding: 4px 8px 0px 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: larger;
        color: grey;
    }
    .vue-filter-control ul > li > a:hover {
        color: lighten(grey, 20%);
        text-decoration: none;
    }

    .vue-filter-control .add-new-filter {
        width: 100%;
        clear: left;
    }

    .vue-filter-control .selectize-control {
        min-width: 200px;
    }
</style>