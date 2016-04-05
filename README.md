# vue-filter-control
Vue.js UI component that allows users to define multiple filters that can then be used to filter data.

This filter control does not re-query your data for you, but provides a control for users to easily set filters. Whenever the filter changes, a filter-change event is fired and the bound data is synced, so that you can refresh your data based upon the latest filters. 

# Requirements

- Vue.js ^`1.0.16`
- vue-selectize  (Vue.js v1 branch currently pulls from github.com/martynling/vue-selectize)

# Installation
Assuming that you'll be using gulp or browserify to roll all your js into a single file:
 
```shell
$ npm install vue-filter-control --save-dev
```

# Usage

```javascript
var Vue = require('vue');
import VueFilterControl from 'vue-filter-control'
Vue.component('vue-filter-control', VueFilterControl)
```

After installing the plugin you can use it like this

```html
<vue-filter-control
    @filter-changed="refreshData"
    :columns="columns"
    :active-filters.sync="myFilters">
</vue-filter-control>
```

```javascript
var vm = new Vue({
    el: 'body',
    data: {
        columns: {
            'first_name': { 
                displayName: 'First Name',
                dataType: 'string'
            },
            'languages_spoken': {
                displayName: 'Languages Spoken Fluently',
                dataType: 'multi-select',
                options: [
                    { key: 'en', value: 'English' },
                    { key: 'fr', value: 'French' },
                    { key: 'pt', value: 'Portuguese' },
                    { key: 'es', value: 'Spanish' }
                    // ...more languages
                ],
                maxItems: 10            
            }
        },
        myFilters: [
            { column: 'first_name', operator: '=', value: 'Frank' },
            { column: 'languages_spoken', operator: 'in', value: 'en,fr' }
        ]
    },
    
    methods: {
        refreshData() {
            // Your AJAX or other code to requery your data based on the latest filters
        }
    }
});
```


## Props

- `columns` is an object (essentially an associative array) defining the columns that can be used to filter data. See columns format below.
- `active-filters` is an array that defines the current active filter. Any changes to the filter within the filter control will sync to the bound data. See data-filters format below.

### columns object format

Example:
```javascript
 columns: { 
    'first_name': {
        displayName: 'First Name',
        dataType: 'string'    
    },
    'languages_spoken': {
        displayName: 'Languages Spoken Fluently',
        dataType: 'multi-select',
        options: [
            { key: 'en', value: 'English' },
            { key: 'fr', value: 'French' },
            { key: 'pt', value: 'Portuguese' },
            { key: 'es', value: 'Spanish' }
            // ...more languages
        ],
        maxItems: 10            
    }    
 }
```

 - `name/key` - db column/model attribute name
 - `displayName` - display name of the column for the user
 - `dataType` - the column's dataType - currently supports `string`, `integer`, `date`, `datetime`, `multi-select` (from provided options)
 - `options` (for datatype multi-select) - array with each array element in format { key: 'key', value: 'value' }
 - `maxItems` (for datatype multi-select) - the maximum number of values that can be selected from the options array 

### active-filters format

Often vue-filter-control will be loaded with no active filters. However, should you want to load it with a saved filter or parameters that have been passed, you can set the active filters array with each filter in the following format:

 - `column` - actual db column name/model attribute name (corresponds to column name in columns object format) 
 - `operator` - either abbreviated internal version of operator or the actual operator that might be used in the query on the server (assumes measures will be taken on server to address SQL injection, etc.) 
 - `value` - value that would be used in an actual query

## Events

 - `filter-changed` - whenever a change to the filters is set in the filter control, a filter-changed event occurs. The data bound to data-filters is also synced. So, this enables the data that depends on the filter to be requeried  

# Future Developments

When time allows, I would like to develop the following:

 - Demo site
 - Localization
 - Extend operators to include use of NOT
 - Ability to use OR logic and nesting (currently only AND is supported as logic between filters)
