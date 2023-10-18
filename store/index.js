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

const baseState = {
  auth: {
    token: null,
    user: {}
  },
  book: {
    title: null,
    isbn: null
  },
  books: {},
  authors: {},
  author: {
    books: []
  }
};

const baseSuccess = {
  ...baseState
};

const baseError = {
  ...baseState
};

export default () =>
  new Vuex.Store({
    state: {
      auth: baseState.auth,
      books: baseState.books,
      authors: baseState.authors,
      author: baseState.author,
      book: baseState.book,
      success: baseSuccess,
      error: baseError
    },

    mutations: {
      SET_SUCCESS(state, { config, payload }) {
        state.success = {
          ...state.success,
          [config]: payload,
        }
      },

      SET_ERROR(state, { config, payload }) {
        state.error = {
          ...state.error,
          [config]: payload
        };
      },

      RESET_ERRORS(state) {
        state.error = {
          ...baseState
        }
      },

      SET_USER({ auth }, payload) {
        auth.token = payload.token;
        auth.user = payload.user;
      },

      RESET_STATE(state, { config }) {
        state[config] = {
          ...baseState[config]
        };
      },

      SET_AUTHORS(state, data) {
        state.authors = data;
      },

      SET_BOOKS_BY_AUTHOR(state, data) {
        state.author = {
          ...data
        };
      },

      SET_BOOKS(state, data) {
        state.books = {
          ...data
        };
      }
    },

    actions: {
      async login({ commit }, data) {
        commit('RESET_STATE', { config: 'auth'});
        commit('RESET_ERRORS')

        try {
          const response = await this.$axios.$post('/users/login', data);
          commit('SET_SUCCESS', {
            config: 'auth',
            payload: {
              detail: response.detail,
              status: 200
            }
          })
          commit('SET_USER', response);
          return response;
        } catch (e) {
          const { field, detail } = get(e, 'response.data', {});
          commit('SET_ERROR', {
            config: 'auth',
            payload: {
              detail,
              status: get(e, 'response.status', 400),
              field
            }
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
          return data;
        } catch (e) {
          console.log({ e });
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
          return data;
        } catch (e) {
          console.log({ e });
        }
      },

      async getAuthors({ commit, state }) {
        try {
          const {
            data: { authors, detail },
            status
          } = await this.$axios.get('/authors', {
            headers: {
              Authorization: `Bearer ${state.auth.token}`
            }
          });
          commit(
            'SET_AUTHORS',
            authors.map((author, index) => ({ ...author, id: index + 1, author_id: author.id }))
          );
          commit('SET_SUCCESS', {
            authors: {
              detail,
              status
            }
          });
          return authors;
        } catch (e) {
          console.log({ e });
        }
      },

      async getBooks({ commit, state }) {
        try {
          const {
            data: { books, detail },
            status
          } = await this.$axios.get('/users/books', {
            headers: {
              Authorization: `Bearer ${state.auth.token}`
            }
          });
          commit('SET_BOOKS', books);
          commit('SET_SUCCESS', {
            books: {
              detail,
              status
            }
          });
          return books;
        } catch (e) {
          console.log({ e });
        }
      },

      async getBooksByAuthor({ commit, state }, author) {
        try {
          const {
            data: { books, detail },
            status
          } = await this.$axios.get(`/authors/${author.id}/books`, {
            headers: {
              Authorization: `Bearer ${state.auth.token}`
            }
          });
          commit('SET_BOOKS_BY_AUTHOR', { ...author, books });
          commit('SET_SUCCESS', {
            author: {
              detail,
              status
            }
          });
          return books;
        } catch (e) {
          console.log({ e });
        }
      }
    },

    getters: {
      errors: (state) => state.auth.error
    }
  });
