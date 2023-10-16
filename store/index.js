import Vue from 'vue';
import Vuex from 'vuex';
import { get } from 'lodash';

Vue.use(Vuex);

const statusDefaults = {
  error: {
    detail: null,
    status: null,
    field: null
  },
  success: {
    message: null,
    status: null
  }
};
const authDefaults = {
  ...statusDefaults,
  token: null,
  user: {}
};

const authorDefaults = {
  ...statusDefaults,
  author: {
    name: null
  }
};
const booksDefaults = {
  ...statusDefaults,
  books: [{}]
};

const authorsDefaults = {
  ...statusDefaults,
  authors: [{}]
}

export default () =>
  new Vuex.Store({
    state: {
      auth: authDefaults,
      books: booksDefaults,
      authors: authorsDefaults
    },

    mutations: {
      SET_USER({ auth }, payload) {
        auth.token = payload.token;
        auth.user = payload.user;
        auth.success = {
          message: payload.message,
          status: payload.status
        };
        auth.error = {
          message: null,
          status: null
        };
      },

      RESET_AUTH(state) {
        state.auth = {
          ...authDefaults
        };
      },

      SET_ERROR(state, error) {
        state.auth = {
          ...authDefaults,
          error
        };
      }
    },

    actions: {
      async login({ commit }, data) {
        try {
          commit('RESET_AUTH');
          const response = await this.$axios.$post('/users/login', data);
          commit('SET_USER', response);
          return response;
        } catch (e) {
          const { field, detail } = get(e, 'response.data', {});
          commit('SET_ERROR', {
            detail,
            status: get(e, 'response.status', 400),
            field
          });
          throw e;
        }
      },

      async getAuthStatus({ commit }) {
        try {
          const response = await this.$localforage.getItem('user');
          commit('SET_USER', response);
          return response;
        } catch (e) {
          commit('SET_USER', authDefaults);
        }
      },

      async addAuthor({ commit, state }, author) {
        try {
          const { data } = await this.$axios.post(
            '/authors',
            { ...author, created_by: get(state, 'auth.user.id') },
            {
              headers: {
                Authorization: `Bearer ${state.auth.token}`
              }
            }
          );
         return data
        } catch (e) {
          console.log({ e })
        }
      },

      async addBooks({ commit, state }, { author, books }) {
        try {
          const { data } = await this.$axios.post(
            `/authors/${author.id}/books`,
            { books },
            {
              headers: {
                Authorization: `Bearer ${state.auth.token}`
              }
            }
          );
          return data
        } catch (e) {
          console.log({ e })
        }
      }
    },

    getters: {
      errors: (state) => state.auth.error
    }
  });
