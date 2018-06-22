<template>
  <div id="app" role="main">
    <img src="./assets/logo.png" alt="Vue Logo">
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
import VueFilterControl from './components/vue-filter-control'
import Column from './components/column.js'

export default {
  name: 'App',
  components: {
    VueFilterControl
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
        new Column({
          name: 'id',
          displayName: '#',
          dataType: 'number',
          optGroup: 'user'
        }),
        new Column({
          name: 'email',
          displayName: 'Email',
          dataType: 'string',
          optGroup: 'user'
        }),
        new Column({
          name: 'first_name',
          displayName: 'First Name',
          dataType: 'string',
          optGroup: 'user'
        }),
        new Column({
          name: 'last_name',
          displayName: 'Last Name',
          dataType: 'string',
          optGroup: 'user'
        }),
        new Column({
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
        }),
        new Column({
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
        }),
        new Column({
          name: 'roleTitle',
          displayName: 'Role',
          dataType: 'string',
          notFilterable: true
        }),
        new Column({
          name: 'joined',
          displayName: 'Joined',
          dataType: 'date',
          optGroup: 'user'
        }),
        new Column({
          name: 'last_login',
          displayName: 'Last logged in',
          dataType: 'datetime',
          optGroup: 'user'
        }),
        new Column({
          name: 'notes',
          displayName: 'Notes',
          dataType: 'string',
          dataFormat: 'paragraph',
          expandable: true,
          expandableFrom: 20,
          optGroup: 'user'
        }),
        new Column({
          name: 'id',
          displayName: '#',
          dataType: 'number',
          optGroup: 'item'
        }),
        new Column({
          name: 'name',
          displayName: 'Name',
          dataType: 'string',
          optGroup: 'item'
        }),
        new Column({
          name: 'price',
          displayName: 'Price',
          dataType: 'number',
          optGroup: 'item'
        })
      ]
    }
  },

  methods: {
    refreshData (e) {
      alert('filter-changed event fired. Data passed:\n' + JSON.stringify(e))
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.vue-filter-control {
  text-align: left;
}
.data-display {
  clear: left;
  text-align: left;
}
</style>
