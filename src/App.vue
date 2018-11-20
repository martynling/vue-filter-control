<template>
  <div id="app">
    <h1>Vue Filter Control Dev</h1>
    <vue-filter-control
        @filter-changed="refreshData"
        :columns="columns"
        :active-filters="myFilters"
        :opt-groups="optGroups"
    >
    </vue-filter-control>
    <div class="data-display">
      Your filters object:
      <pre>{{ myFilters }}</pre>
    </div>
  </div>
</template>

<script>
import VueFilterControl from './components/VueFilterControl.vue'

export default {
  components: {
    'vue-filter-control': VueFilterControl
  },
  data: function () {
    return {
      loading: false,
      myFilters: [],
      optGroups: [
        {value: 'user', label: 'User'},
        {value: 'item', label: 'Purchased Item'}
      ]
    }
  },

  computed: {
    columns () {
      return [
        {
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
          name: 'first_name',
          displayName: 'First Name',
          dataType: 'string',
          optGroup: 'user'
        }, {
          name: 'last_name',
          displayName: 'Last Name',
          dataType: 'string',
          optGroup: 'user'
        }, {
          name: 'role_id',
          displayName: 'Role',
          dataType: 'choice',
          options: [
              {key: 1, value: 'Admin'},
              {key: 2, value: 'Owner'},
              {key: 3, value: 'Quality Control'}
          ],
          hidden: true,
          optGroup: 'user'
        }, {
          name: 'music_id',
          displayName: 'Favourite Music',
          dataType: 'choice',
          options: [
            {key: 0, value: 'Classical'},
            {key: 1, value: 'Funk'},
            {key: 2, value: 'Jazz'},
            {key: 3, value: 'Pop'},
            {key: 4, value: 'Ska'}
          ],
          maxItems: 3,
          hidden: true,
          optGroup: 'user'
        }, {
          name: 'thing_id',
          displayName: 'Things',
          dataType: 'choice',
          options: [
            {key: 'Thing1', value: 'Thing1'},
            {key: 'Thing2', value: 'Thing2'},
            {key: 'Thing3', value: 'Thing3'},
            {key: 'Thing4', value: 'Thing4'},
            {key: 'Thing5', value: 'Thing5'},
          ],
          maxItems: 3,
          hidden: true,
          optGroup: 'user'
        }, {
          name: 'roleTitle',
          displayName: 'Role',
          dataType: 'string',
          notFilterable: true
        }, {
          name: 'joined',
          displayName: 'Joined',
          dataType: 'date',
          optGroup: 'user'
        }, {
          name: 'last_login',
          displayName: 'Last logged in',
          dataType: 'datetime',
          optGroup: 'user'
        }, {
          name: 'notes',
          displayName: 'Notes',
          dataType: 'string',
          dataFormat: 'paragraph',
          expandable: true,
          expandableFrom: 20,
          optGroup: 'user'
        }, {
          name: 'item_id',
          displayName: '#',
          dataType: 'number',
          optGroup: 'item'
        }, {
          name: 'name',
          displayName: 'Name',
          dataType: 'string',
          optGroup: 'item'
        }, {
          name: 'price',
          displayName: 'Price',
          dataType: 'number',
          optGroup: 'item'
        }
      ]
    }
  },

  methods: {
    refreshData (e) {
      console.log('filter-changed event fired. Data passed:\n' + JSON.stringify(e))
    }
  }
}
</script>

<style>
body {
  font-family: Helvetica, sans-serif;
}
  .data-display {
    clear: left;
  }
</style>
