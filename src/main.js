import Vue from 'vue'
import App from './App.vue'

window.Vue = Vue

window.$ = window.jQuery = require('jquery')

var VueSelectize = require('vue-selectize')
Vue.use(VueSelectize)
window.VueSelectize = VueSelectize

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { App }
})

