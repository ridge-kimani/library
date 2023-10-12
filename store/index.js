import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const authDefaults = {
  error: {
    message: null,
    code: null
  },
  success: {
    message: null,
    code: null
  },
  token: null,
  user: null
}

export default () => new Vuex.Store({
  state: {
    auth: authDefaults
  },
  mutations: {
    SET_USER({ auth }, payload) {
      auth.token = payload.token
      auth.user = payload.user
      auth.success = {
        message: payload.message,
        status: payload.status
      }
      auth.error = {
        message: null,
        status: null
      }
    },

    SET_ERROR({ auth }, payload) {
      auth = {
        ...authDefaults,
        error: {
          message: '',
          code: ''
        }
      }
    }
  },
  actions: {
    async login({ commit }, data) {
      try {
        const response = await this.$axios.$post('/authors/login', data);
        commit('SET_USER', response)
        return response
      } catch (e) {
        commit('SET_ERROR', {
          message: '',
          code: ''
        })
      }
    },

    async getAuthStatus({ commit }) {
      const response = await this.$localforage.getItem('author')
      commit('SET_USER', response)
      return response
    }
  }
});
