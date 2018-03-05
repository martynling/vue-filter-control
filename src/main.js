import Vue from 'vue/dist/vue.js'
import App from './App.vue'

window.Vue = Vue

window.$ = window.jQuery = require('jquery')

/* eslint-disable no-new */
new Vue({
  el: '#vue-app',
  components: { App }
})
