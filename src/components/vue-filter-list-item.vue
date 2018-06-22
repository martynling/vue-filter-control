<template>
    <li class="filter-box">
        <span id="sr-list-description" class="screen-reader-only">{{ filterText }}</span>
        <button :class=buttonEditClass
           v-on:click="editFilter(filter)"
           :aria-label=editFilterText
        >
            {{ filterText }}
        </button>
        <button :class=buttonRemoveClass
                v-on:click="removeFilter(filter)"
                :aria-label=removeFilterText>
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
  computed: {
    buttonEditClass () {
      return `filter-text filter-edit-${this.filter.column.name}`
    },
    buttonRemoveClass () {
      return `filter-remove filter-remove-${this.filter.column.name}`
    },
    filterText () {
      return `${this.filter.column.displayName} ${this.filter.operator.displayText} ${this.getFilterValueDisplayText(this.filter.value)}`
    },
    editFilterText () {
      return `Edit filter '${this.filterText}'`
    },
    removeFilterText () {
      return `Remove filter '${this.filterText}'`
    }
  },
  methods: {
    editFilter (filter) {
      this.$emit('filter-edited', filter)
    },

    getFilterValueDisplayText (filterValue) {
      if (Array.isArray(filterValue)) {
        return filterValue.map((item) => {
          return item.value
        }).join(', ')
      }
      return filterValue.value
    },

    removeFilter (filter) {
      this.$emit('filter-removed', filter)
    }
  }
}
</script>

<style scoped>
    .screen-reader-only {
        position: absolute;
        height: 1px;
        width: 1px;
        clip: rect(1px,1px,1px,1px);
        clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
        -webkit-clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
        overflow: hidden !important;
    }

    .filter-box {
        color: #fff;
        height: 30px;
        line-height: 30px;
        overflow: hidden;
        position: relative;
        text-decoration: none;
        border-radius: 3px;
        background: #337ab7;
        display: inline-block;
        margin-right: 4px;
    }

    .filter-box > .filter-text {
        background: #337ab7;
        padding: 0 8px 0;
        text-decoration: none;
        border: none;
    }

    .filter-box > .filter-text:hover {
        background: #000;
        text-decoration: underline;
        cursor: pointer;
    }

    .filter-box > .filter-remove {
        padding: 1px 8px 0;
        margin-left: -4px;
        background: #337ab7;
        border: none;
        border-left: 1px solid rgba(255, 255, 255, 0.3);
        cursor: pointer;
    }

    .filter-box > .filter-remove .glyphicon {
        top: 2px;
    }

    .filter-box > .filter-remove:hover {
        color: #fff;
        background: #000;
        text-decoration: none;
    }
</style>
