import Vue from 'vue';
import Vuex from 'vuex';
import { get } from 'lodash'

Vue.use(Vuex);


const getCode = (str) => str.match(/\d+$/)[0];

const authDefaults = {
  error: {
    detail: null,
    status: null,
    field: null
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

    RESET_AUTH(state) {
      state.auth = {
        ...authDefaults
      }
    },

    SET_ERROR(state, error) {
      state.auth = {
        ...authDefaults,
        error
      }
    }
  },
  actions: {
    async login({ commit }, data) {
      try {
        commit('RESET_AUTH')
        const response = await this.$axios.$post('/users/login', data);
        commit('SET_USER', response)
        return response
      } catch (e) {
        const { field, detail } = get(e, 'response.data', {})
        commit('SET_ERROR', {
          detail,
          status: get(e, 'response.status', 400),
          field
        })
        throw e
      }
    },

    async getAuthStatus({ commit }) {
      try {
        const response = await this.$localforage.getItem('author')
        commit('SET_USER', response)
        return response
      } catch (e) {
        commit('SET_USER', authDefaults)
      }
    }
  },
  getters: {
    errors: (state) => state.auth.error
  }
});
