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
    name: null,
    id: null,
    books: [{}]
  }
};

const authorsDefaults = {
  ...statusDefaults,
  authors: [{}]
};

const booksDefaults = {
  ...statusDefaults,
  books: [{}]
};

const bookDefaults = {
  ...statusDefaults,
  book: {
    title: null,
    isbn: null
  }
};

const baseState = {
  auth: {},
  book: {},
  books: {},
  authors: {},
  author: {}
};

const success = {
  ...baseState
};

const error = {
  ...baseState
};

export default () =>
  new Vuex.Store({
    state: {
      auth: authDefaults,
      books: baseState.books,
      authors: baseState.authors,
      author: authorDefaults,
      book: bookDefaults,
      success,
      error
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
      },

      SET_AUTHORS(state, data) {
        state.authors = data;
      },

      SET_SUCCESS({ success }, payload) {
        success = {
          ...success,
          payload
        };
      },

      SET_BOOKS_BY_AUTHOR(state, data) {
        state.author = {
          ...data
        }
      },

      SET_BOOKS(state, data) {
        state.books = {
          ...data
        }
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
          commit('SET_AUTHORS', authors);
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
