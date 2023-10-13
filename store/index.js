import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const errors = {
  200: {
    message: ''
  },

  401: {
    message: 'Password is incorrect',
    field: 'password'
  },

  404: {
    message: 'Username not found',
    field: 'username'
  }
}

const getCode = (str) => str.match(/\d+$/)[0];

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
        const response = await this.$axios.$post('/authors/login', data);
        commit('SET_USER', response)
        return response
      } catch (e) {
        const code = parseInt(getCode(e.message))
        const { message, field } = errors[code]
        commit('SET_ERROR', {
          [field]: message,
          code
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
