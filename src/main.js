import Vue from 'vue'
import App from './App'
import router from './router'
import CoreuiVue from '@coreui/vue'
import { iconsSet as icons } from './assets/icons/icons.js'

import axios from 'axios'                   //Mingzoo
import VueAxios from 'vue-axios'            //Mingzoo
import BootstrapVue from 'bootstrap-vue'    //Mingzoo

Vue.config.performance = true
Vue.use(CoreuiVue)

Vue.use(VueAxios, axios)    //Mingzoo
Vue.use(BootstrapVue)

new Vue({
  el: '#app',
  router,
  icons,
  template: '<App/>',
  components: {
    App
  },
})
