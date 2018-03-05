# vue-filter-control
Vue.js UI component that allows users to define multiple filters that can then be used to filter data.

This filter control does not re-query your data for you, but provides a control for users to easily set filters. Whenever the filter changes, a filter-change event is fired passing the latest set of filters, so that you can refresh/re-query your data. 

# Requirements

- Vue.js ^`2.0.0`
- vue2-selectize
- jquery `"^3.3.1"` (We require v3 of jquery since v2 has security vulnerabilities) 


# Installation
Assuming that you'll be using gulp or browserify to roll all your js into a single file:
 
```shell
$ npm install vue-filter-control --save-dev
```

You may also need to add the following to the devDependencies of a Laravel project to make the gulp build work:
``` 
"babel-preset-stage-2": "^6.1.18"
```

## Build Setup

``` bash
# install dependencies
npm install
```
Simple demo available at localhost:8080/demo:
``` bash
# serve with hot reload at localhost:8080
npm run dev
```

``` bash
# build for production with minification
npm run build

# lint all *.js and *.vue files
npm run lint

# run unit tests
npm test
```

For more information see the [docs for vueify](https://github.com/vuejs/vueify).

# Changes between v1.0 and v2.0

Now dependent on Vue 2.0 and vue2-selectize.

* The activeFilters property is no longer bound two-way since this is no longer supported in Vue 2.0. Instead whenever the activeFilters are changed within vue-filter-control, a `FilterChanged` event is fired and the updated activeFilters are passed as a parameter to the event.

# Changes between v0.0.2 and v1.0.0

* dataType `multi-select` renamed to `choice`
* dropdowns support typeahead
* clicking on an existing filter enables it to be edited (instead of having to delete a filter and add a new one)
* support for option groups within the filter list

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
    :active-filters="myFilters"
    :opt-groups="optGroups">
</vue-filter-control>
```

```javascript
var vm = new Vue({
    el: '#some-div-id',
    data: {
        columns: [ 
            {
                name: 'first_name', 
                displayName: 'First Name',
                dataType: 'string'    
            },{
                name: 'languages_spoken',
                displayName: 'Languages Spoken Fluently',
                dataType: 'choice',
                options: [
                    { key: 'en', value: 'English' },
                    { key: 'fr', value: 'French' },
                    { key: 'pt', value: 'Portuguese' },
                    { key: 'es', value: 'Spanish' }
                    // ...more languages
                ],
                maxItems: 10,
                optGroup: 'group1'
            }    
        ],
        myFilters: [
            { column: 'first_name', operator: '=', value: 'Frank' },
            { column: 'languages_spoken', operator: 'in', value: 'en,fr' }
        ],
        optGroups: [
            {value: 'group1', label: 'Group One'},
            {value: 'group2', label: 'Group Two'}            
        ]
    },
    
    methods: {
      
        refreshData(activeFilters) {
            // Your AJAX or other code to requery your data based on the latest filters
        }
    }
});
```

You'll also want to load one of selectize's CSS files to style your inputs. You should find what you want in `node_modules/selectize/dist/css`. See http://selectize.github.io/selectize.js/ for more info. 

## Props

- `columns` is an array of columns that can be used to filter data. See columns format below.
- `active-filters` is an array that defines the current active filter. See FilterChanged event below for how changes to active-filters are passed back.

### columns object format

Example:
```javascript
 columns: [ 
    {
        name: 'first_name', 
        displayName: 'First Name',
        dataType: 'string'    
    },{
        name: 'languages_spoken',
        displayName: 'Languages Spoken Fluently',
        dataType: 'choice',
        options: [
            { key: 'en', value: 'English' },
            { key: 'fr', value: 'French' },
            { key: 'pt', value: 'Portuguese' },
            { key: 'es', value: 'Spanish' }
            // ...more languages
        ],
        maxItems: 10            
    }    
 ]
```

 - `name` - db column/model attribute name
 - `displayName` - display name of the column for the user
 - `dataType` - the column's dataType - currently supports `string`, `number`, `date`, `datetime`, `choice` (from provided options)
 - `options` (for datatype choice) - array with each array element in format { key: 'key', value: 'value' }
 - `maxItems` (for datatype choice) - the maximum number of values that can be selected from the options array
 - `notFilterable` - if the same columns array is being used to populate a table (or other) but a particular column should be filterable, set notFilterable to true. You don't need to include notFilterable: false - that will be assumed.
 - `optGroup` - if you want to group columns into an optGroup, specify the optGroup value for each column

### active-filters format

Often vue-filter-control will be loaded with no active filters. However, should you want to load it with a saved filter or parameters that have been passed, you can set the active filters array with each filter in the following format:

 - `column` - actual db column name/model attribute name (corresponds to column name in columns object format) 
 - `operator` - either abbreviated internal version of operator or the actual operator that might be used in the query on the server (assumes measures will be taken on server to address SQL injection, etc.) 
 - `value` - value that would be used in an actual query

### opt-groups format

If you want columns to be grouped into options groups, you define the option groups via the opt-group prop
 - `value` - the unique identifier for the option group
 - `label` - the label is displayed in the select

## Events

 - `filter-changed` - whenever a change to the filters is set in the filter control, a filter-changed event occurs which passes the complete set of filters. Note: in the latest version, active-filters is no longer bound 2 ways so you'll need to sync your activeFilters.  
 