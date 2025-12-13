import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    language: localStorage.getItem('language') || 'zh-CN'
  },
  mutations: {
    SET_LANGUAGE(state, language) {
      state.language = language
      localStorage.setItem('language', language)
    }
  },
  actions: {
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    }
  },
  modules: {
  }
})
