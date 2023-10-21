import Vue from 'vue';
import Vuex from 'vuex';
import { get } from 'lodash';

Vue.use(Vuex);

const baseState = {
  auth: {
    token: null,
    user: {}
  },
  book: {
    title: null,
    isbn: null
  },
  books: [],
  authors: [],
  author: {
    books: []
  }
};

const baseSuccess = {
  auth: {},
  book: {},
  books: {},
  authors: {},
  author: {}
};

const baseError = {
  auth: {},
  book: {},
  books: {},
  authors: {},
  author: {}
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
          [config]: payload
        };
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
        };
      },

      RESET_SUCCESS(state) {
        state.success = {
          ...baseState
        };
      },

      RESET_STATE(state, { config }) {
        state[config] = {
          ...baseState[config]
        };
      },

      RESET_RESPONSES(state, { config }) {
        state.success = {
          ...state.success,
          [config]: {}
        };
        state.error = {
          ...state.error,
          [config]: {}
        };
      },

      SET_USER({ auth }, payload) {
        auth.token = payload.token;
        auth.user = payload.user;
      },

      SET_SELECTED_AUTHOR({ author }, payload) {
        author = {
          ...author,
          payload
        };
      },

      SET_AUTHORS(state, data) {
        state.authors = data.sort((a, b) => b.updated - a.updated);
      },

      SET_BOOKS_BY_AUTHOR(state, data) {
        state.author = {
          ...data
        };
      },

      SET_BOOKS(state, data) {
        state.books = data
          .map((book) => ({
            ...book,
            updated: new Date(book.updated)
          }))
          .sort((a, b) => b.updated - a.updated);
      }
    },

    actions: {
      async login({ commit }, data) {
        commit('RESET_RESPONSES', { config: 'auth' });
        commit('RESET_ERRORS');

        try {
          const response = await this.$axios.$post('/users/login', data);
          commit('SET_SUCCESS', {
            config: 'auth',
            payload: {
              detail: response.detail,
              status: 200
            }
          });
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
        commit('RESET_RESPONSES', { config: 'auth' });
        try {
          const response = await this.$localforage.getItem('user');
          commit('SET_USER', response);
          commit('SET_SUCCESS', {
            config: 'auth',
            payload: {
              detail: 'Authenticated successful.',
              status: 200
            }
          });
          return response;
        } catch (e) {
          commit('SET_USER', {});
          commit('SET_ERROR', {
            config: 'auth',
            payload: {
              detail: 'Authentication unsuccessful.',
              status: get(e, 'response.status', 400)
            }
          });
          throw e;
        }
      },

      async getAuthors({ commit, state }) {
        commit('RESET_RESPONSES', { config: 'authors' });
        try {
          const {
            data: { authors, detail },
            status
          } = await this.$axios.get('/authors', {
            headers: {
              Authorization: `Bearer ${state.auth.token}`
            }
          });
          commit('SET_AUTHORS', authors.map((author, index) => ({
            ...author,
            id: index + 1,
            author_id: author.id,
            updated: new Date(author.updated)
          })));
          commit('SET_SUCCESS', {
            config: 'authors',
            payload: {
              detail,
              status
            }
          });
          return authors;
        } catch (e) {
          const { detail } = get(e, 'response.data', {});
          commit('SET_ERROR', {
            config: 'authors',
            payload: {
              detail,
              status: get(e, 'response.status', 400)
            }
          });
          throw e;
        }
      },

      async addAuthor({ commit, state }, author) {
        try {
          const count = author.count;
          delete author.count;
          const { data } = await this.$axios.post(
            '/authors',
            { ...author },
            {
              headers: {
                Authorization: `Bearer ${state.auth.token}`
              }
            }
          );
          commit('SET_AUTHORS', [{ ...data.author, author_id: data.author.id, count }, ...state.authors]);
          return data;
        } catch (e) {
          console.log({ e });
        }
      },

      async addBooks({ commit, state, dispatch }, { author, books }) {
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
          commit('SET_BOOKS', [...data.books, ...state.books]);
          return data;
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
        commit('RESET_STATE', { config: 'author' });
        try {
          const {
            data: { books, detail },
            status
          } = await this.$axios.get(`/authors/${author.author_id}/books`, {
            headers: {
              Authorization: `Bearer ${state.auth.token}`
            }
          });
          commit('SET_BOOKS_BY_AUTHOR', {
            ...author,
            books: books
              .map((book) => ({
                ...book,
                updated: new Date(book.updated)
              }))
              .sort((a, b) => b.updated - a.updated)
          });
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
      },

      async updateAuthor({ commit, state }, author) {
        console.log('UPDATE AUTHOR');
        return {};
      },

      async updateBooks({ commit, state }, { books, author }) {
        console.log('UPDATE BOOKS');
        return {};
      },

      async deleteBook({ commit, state }, { author, book }) {
        try {
          await this.$axios.delete(`/authors/${author.id}/books/${book.id}`, {
            headers: {
              Authorization: `Bearer ${state.auth.token}`
            }
          });
          const books = state.books.filter(book_ => book_.id !== book.id)
          commit('SET_BOOKS', books)
        } catch (e) {
          console.log({ e });
        }
      },

      async deleteAuthor({ commit, state }, { author }) {
        try {
          await this.$axios.delete(`/authors/${author.id}/`, {
            headers: {
              Authorization: `Bearer ${state.auth.token}`
            }
          });
          const authors = state.authors.filter(author_ => author_.author_id !== author.id)
          commit('SET_AUTHORS', authors);
        } catch (e) {
          console.log({ e });
        }
      }
    },

    getters: {
      errors: (state) => state.auth.error
    }
  });
