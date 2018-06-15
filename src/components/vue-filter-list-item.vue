<template>
    <li class="filter-box">
        <button class="filter-text"
           v-on:click="editFilter(filter)"
           aria-label="Edit"
        >
            {{ getColumnDisplayName(filter.column) }}
            {{ getOperatorDisplayText(filter.column, filter.operator) }}
            {{ getFilterValueDisplayText(filter.column, filter.value) }}
        </button>
        <button class="filter-remove"
                v-on:click="removeFilter(filter)"
                aria-hidden="true"
                aria-label="Remove">
            <span class="glyphicon glyphicon-remove"></span>
        </button>
    </li>
</template>

<script>
export default {
  name: 'vue-filter-list-item',
  props: {
    filter: {
      type: Object
    }
  },
  methods: {
    editFilter (filter) {
      this.$emit('filter-edited', filter)
    },

    getColumnDisplayName (columnName) {
      return this.$parent.getColumnDisplayName(columnName)
    },

    getOperatorDisplayText (columnName, key) {
      return this.$parent.getOperatorDisplayText(columnName, key)
    },

    getFilterValueDisplayText (columnName, filterValue) {
      return this.$parent.getFilterValueDisplayText(columnName, filterValue)
    },

    removeFilter (filter) {
      this.$emit('filter-removed', filter)
    }
  }
}
</script>

<style scoped>

</style>
