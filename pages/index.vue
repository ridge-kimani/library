<template>
  <div class="page">
    <div v-if="!loading">
      <div class="mx-10 pt-5 d-flex justify-content-between">
        <div v-if="authorsActive">
          <b-button variant="success" @click="toggleAddAuthor">Add Author</b-button>
        </div>
        <div v-if="booksActive">
          <b-button variant="success" @click="toggleAddBook">Add Book</b-button>
        </div>
        <div>
          <b-button @click="logout" variant="outline-danger">Logout</b-button>
        </div>
      </div>

      <div class="d-flex flex-column align-items-center">
        <div class="my-5">
          <b-form-input :id="`search`" type="search" :placeholder="searchPlaceholder" v-model="search"></b-form-input>
        </div>
      </div>
      <div class="mx-10">
        <b-nav tabs align="center">
          <b-nav-item :active="authorsActive" @click="toggleTab('authors')">Authors</b-nav-item>
          <b-nav-item :active="booksActive" @click="toggleTab('books')">Books</b-nav-item>
        </b-nav>
        <!-- Authors table   -->
        <div v-if="authorsActive">
          <div>
            <b-table
              id="author-table"
              striped
              hover
              select-mode="single"
              :isBusy="loadingAuthors"
              :items="allAuthors"
              :fields="authorsFields"
              :per-page="authorTablePerPage"
              :current-page="authorTableCurrentPage"
              selectable
              @row-clicked="authorRowClicked"
              v-b-modal.edit-author
            >
              <template #table-busy>
                <div class="text-center text-danger my-2">
                  <b-spinner class="align-middle"></b-spinner>
                  <strong>Loading...</strong>
                </div>
              </template>
            </b-table>
          </div>
          <b-pagination
            class="justify-content-center my-5"
            v-model="authorTableCurrentPage"
            :total-rows="authorTableRows"
            :per-page="authorTablePerPage"
            aria-controls="author-table"
          ></b-pagination>
        </div>
        <!--   -->

        <!-- Books table   -->
        <div v-if="booksActive">
          <div>
            <b-table
              id="books-table"
              striped
              hover
              select-mode="single"
              :items="allBooks"
              :fields="bookFields"
              :per-page="booksTablePerPage"
              :current-page="booksTableCurrentPage"
              selectable
              @row-clicked="bookRowClicked"
              v-b-modal.edit-author
            ></b-table>
            <b-pagination
              class="justify-content-center mt-5"
              v-model="booksTableCurrentPage"
              :total-rows="booksTableRows"
              :per-page="booksTablePerPage"
              aria-controls="books-table"
            ></b-pagination>
          </div>
        </div>
        <!--   -->
      </div>

      <!-- Authors Modal -->
      <b-modal
        v-model="authorModal.show"
        :id="authorModal.id"
        :title="authorModal.title"
        @cancel="cancel"
        @close="cancel"
        @ok="handleAuthorOk"
      >
        <div>
          <b-form @submit.stop.prevent="handleAuthorSubmit" ref="form">
            <b-form-group id="name-group" label="Name:" label-for="name">
              <b-form-input id="name" placeholder="Enter name" required v-model="author.name"></b-form-input>
              <b-form-invalid-feedback v-if="formErrors.author.name" force-show>
                Enter the author name
              </b-form-invalid-feedback>
            </b-form-group>

            <div class="my-4 d-flex">
              <b-button variant="outline-success" @click="toggleAddBook">Add Book</b-button>
            </div>
            <div v-if="formErrors.author.books" class="text-danger error-message">Add at least one book</div>
            <b-table
              id="author-books-table"
              striped
              hover
              :items="allAuthorBooks"
              :fields="bookFields"
              :isBusy="loadingAuthorBooks"
              :total-rows="authorBooksRows"
              :per-page="authorBooksTablePerPage"
              :current-page="authorBooksCurrentPage"
              selectable
              @row-clicked="bookRowClicked"
              v-b-modal.edit-book
            >
              <template #table-busy>
                <div class="text-center text-danger my-2">
                  <b-spinner class="align-middle"></b-spinner>
                  <strong>Loading...</strong>
                </div>
              </template>
            </b-table>
            <b-pagination
              class="justify-content-center mt-5"
              v-model="authorBooksCurrentPage"
              :total-rows="authorBooksRows"
              :per-page="authorBooksTablePerPage"
              aria-controls="author-books-table"
            ></b-pagination>
          </b-form>
        </div>
      </b-modal>
      <!-- -->

      <!-- Books Modal -->
      <b-modal
        v-model="bookModal.show"
        :id="bookModal.id"
        :title="bookModal.title"
        @cancel="resetBook"
        @ok="handleSaveBook"
      >
        <div>
          <b-form @submit.stop.prevent="submitBookModal" ref="book-modal">
            <b-form-group id="title-group" label="Title:" label-for="title">
              <b-form-input id="title" placeholder="Enter book title" required v-model="book.title"></b-form-input>
              <b-form-invalid-feedback v-if="formErrors.books.title" force-show>
                Enter the author name
              </b-form-invalid-feedback>
            </b-form-group>
            <b-form-group id="author-select" label="Author:" label-for="author" v-if="booksActive">
              <treeselect v-model="book.author" :multiple="false" :options="options" />
            </b-form-group>
            <b-form-group id="isbn-group" label="Isbn:" label-for="isbn">
              <b-form-input id="isbn" v-model="book.isbn" placeholder="ISBN"></b-form-input>
            </b-form-group>
            <b-form-group id="pages-group" label="Pages:" label-for="pages">
              <b-form-input id="pages" placeholder="Pages" v-model="book.pages"></b-form-input>
            </b-form-group>
            <b-form-group id="group-year" label="Publish Year:" label-for="year">
              <b-form-input id="year" placeholder="Enter publish year" v-model="book.year"></b-form-input>
            </b-form-group>
            <b-form-group id="cost-group" label="Cost:" label-for="cost">
              <b-form-input id="cost" placeholder="Cost" v-model="book.cost"></b-form-input>
            </b-form-group>
          </b-form>
        </div>
      </b-modal>
      <!-- -->
    </div>
  </div>
</template>
<script>
import Navbar from '~/components/navbar.vue';
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  components: {
    Navbar
  },

  data: () => ({
    // Pagination
    authorTablePerPage: 10,
    authorTableCurrentPage: 1,
    authorTableRows: 1,

    authorBooksTablePerPage: 5,
    authorBooksCurrentPage: 1,
    authorBooksRows: 1,

    booksTablePerPage: 10,
    booksTableCurrentPage: 1,
    booksTableRows: 1,

    // Search
    search: '',

    // Table
    bookFields: ['title', 'author', 'isbn', 'pages', 'cost'],
    authorsFields: ['name', 'author_id', 'count'],

    // BooksTable
    allBooks: [],

    // AuthorsTable
    allAuthors: [],

    // Author Modal
    authorModal: {
      selected: '',
      id: '',
      title: '',
      show: false
    },

    // Author Modal State
    author: {
      name: '',
      id: ''
    },
    authorBooks: [],
    addedAuthorBooks: [],

    // Book Modal State
    book: {
      title: '',
      isbn: '',
      cost: '',
      year: '',
      pages: '',
      author: ''
    },
    bookModal: {
      selected: '',
      id: '',
      title: '',
      action: null,
      show: false
    },

    // Loader State
    loading: true,
    loadingAuthorBooks: false,
    loadingAuthors: false,

    // Tab state
    authorsActive: false,
    booksActive: false,

    // Form Errors
    formErrors: {
      author: {},
      books: {}
    },

    // Tree select
    options: []
  }),

  async mounted() {
    let { tab } = this.$route.query;

    try {
      await this.setAuthStatus();
      await this.toggleTab(tab || 'authors');
    } catch (e) {
      await this.logout();
    }
  },

  computed: {
    ...mapState(['authors', 'books']),

    searchPlaceholder() {
      if (this.authorsActive) return 'Search Author';
      return 'Search Book';
    },

    allAuthorBooks() {
      return [...this.addedAuthorBooks, ...this.authorBooks];
    }
  },

  watch: {
    search(val) {
      if (this.authorsActive) {
        this.allAuthors = this.authors.filter((value) => value.name.toLowerCase().includes(val.toLowerCase()));
      }
      if (this.booksActive) {
        this.allBooks = this.books.filter((value) => value.title.toLowerCase().includes(val.toLowerCase()));
      }
    },

    authorsActive() {
      this.search = '';
    },

    authors: {
      deep: true,
      handler(value, prev) {
        if (value !== prev && value.length) {
          this.allAuthors = [...value];
          this.options = value.map((val) => ({
            id: val.author_id,
            label: val.name
          }));
        }
      }
    },

    books: {
      deep: true,
      handler(value, prev) {
        if (value !== prev && value.length) {
          this.allBooks = [...value];
        }
      }
    },

    allAuthors: {
      deep: true,
      handler(value) {
        this.authorTableRows = value.length;
      }
    },

    allAuthorBooks: {
      deep: true,
      handler(values) {
        this.authorBooksRows = values.length;
        this.formErrors.author.books = false;
      }
    },

    allBooks: {
      deep: true,
      handler(values) {
        this.booksTableRows = values.length;
      }
    },

    'author.name': {
      handler(value) {
        if (value) {
          this.formErrors.author = { name: false };
        }
      }
    }
  },

  methods: {
    ...mapActions(['addBooks', 'addAuthor', 'getAuthStatus', 'getAuthors', 'getBooksByAuthor', 'getBooks']),

    ...mapMutations(['SET_USER', 'SET_SELECTED_AUTHOR']),

    // Toggle methods
    async toggleTab(value) {
      if (value === 'books') {
        this.authorsActive = false;
        this.booksActive = true;
        await this.$router.push({ query: { tab: 'books' } });
        await this.getBooks();
        await this.getAuthors();
      }
      if (value === 'authors') {
        this.loadingAuthors = true;
        this.booksActive = false;
        this.authorsActive = true;
        await this.$router.push({ query: { tab: 'authors' } });
        await this.getAuthors();
        this.loadingAuthors = false;
      }
    },

    toggleEditBook() {
      this.bookModal = {
        selected: 'edit-book',
        id: 'edit-book',
        title: 'Edit Book',
        show: true
      };
    },

    checkAuthorForm() {
      const valid = this.$refs.form.checkValidity();
      const { selected } = this.authorModal;
      if (!valid) {
        this.formErrors.author = {
          name: true
        };
        return false;
      }

      if (this.authorsActive && selected === 'add-author') {
        const hasBooks = this.addedAuthorBooks.filter((item) => item.title).length;
        if (!hasBooks) {
          this.formErrors.author = {
            books: true
          };
          return false;
        }
        return true;
      }
      console.log('EDIT AUTHOR');
    },

    checkBookForm() {
      const valid = this.$refs['book-modal'].checkValidity();
      if (!valid) {
        this.formErrors.books = {
          title: true
        };
      }
      return valid;
    },

    submitBookModal(e) {
      e.preventDefault();
      const valid = this.checkBookForm();
      if (valid) {
        this.resetFormErrors();
        this.bookModal = {};
      }
    },

    handleSaveBook(e) {
      const { selected } = this.bookModal;

      if (this.authorsActive) {
        if (selected === 'add-book') {
          return (this.addedAuthorBooks = [
            ...this.addedAuthorBooks,
            {
              ...this.book
            }
          ]);
        }
        console.log('EDIT BOOK');
      }

      if (this.booksActive) {
        if (selected === 'add-book') {
          console.log('ADD BOOK');
          return true;
        }
        console.log('EDIT BOOK');
      }
    },

    handleAuthorSubmit(e) {
      e.preventDefault();
      return this.checkAuthorForm();
    },

    handleAuthorOk(e) {
      const valid = this.handleAuthorSubmit(e);
      if (valid) {
        this.saveAuthor();
      }
    },

    async saveAuthor() {
      this.loadingAuthors = true;

      try {
        const [first_name, last_name] = this.author.name.split(' ');

        if (this.authorModal.id === 'add-author') {
          const books = this.addedAuthorBooks
            .filter((item) => item.title)
            .reduce((acc, value) => {
              if (!acc) acc = [];
              acc.push({
                title: value.title,
                isbn: value.isbn,
                cost: value.cost || 0,
                publish_year: value.year || 0,
                pages: value.pages || 0
              });
              return acc;
            }, []);

          const { author } = await this.addAuthor({
            first_name: first_name,
            last_name: last_name,
            count: books.length
          });

          if (books.length) {
            await this.addBooks({ author, books });
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        this.cancel();
      }
    },

    resetBook() {
      this.book = {
        title: '',
        isbn: '',
        cost: '',
        year: '',
        pages: ''
      };
    },

    resetAuthor() {
      this.author.name = '';
    },

    resetFormErrors() {
      this.formErrors = {
        author: {},
        books: {}
      };
    },

    cancel() {
      this.authorModal = {};
      this.resetBook();
      this.resetAuthor();
      this.addedAuthorBooks = [];
    },

    authorRowClicked(value) {
      this.SET_SELECTED_AUTHOR(value);
      this.author = {
        ...value
      };
      this.toggleEditAuthor();
    },

    setAuthorModal(config) {
      this.authorModal = {
        selected: config.id,
        id: config.id,
        title: config.title,
        show: config.show
      };
    },

    toggleAddAuthor() {
      this.author = {};
      this.authorBooks = [];

      this.resetFormErrors();
      this.setAuthorModal({
        selected: 'add-author',
        id: 'add-author',
        title: 'Add Author',
        show: true
      });
    },

    async toggleEditAuthor() {
      this.loadingAuthorBooks = true;

      this.authorBooks = [];
      this.setAuthorModal({
        selected: 'edit-author',
        id: 'edit-author',
        title: 'Edit Author',
        show: true
      });
      const books = await this.getBooksByAuthor({ ...this.author });
      this.authorBooks = [...books];

      this.loadingAuthorBooks = false;
    },

    setBookModal(config) {
      this.bookModal = {
        selected: config.id,
        id: config.id,
        title: config.title,
        show: config.show
      };
    },

    toggleAddBook() {
      this.book = {};
      this.setBookModal({
        selected: 'add-book',
        id: 'add-book',
        title: 'Add Book',
        show: true
      });
    },

    bookRowClicked(value, index) {
      this.book = {
        ...value,
        index
      };
      this.toggleEditBook();
    },

    async setAuthStatus() {
      this.loading = true;
      try {
        const response = await this.$localforage.getItem('user');
        if (!response.token) {
          this.SET_USER({});
          return this.$router.push('/login');
        }
        this.SET_USER({
          token: response.token,
          user: response.user
        });
      } catch (e) {
        this.SET_USER({});
        await this.$router.push('/login');
      }
      this.loading = false;
    },

    async logout() {
      await this.$localforage.setItem('user', {});
      await this.$router.push('/login');
    }
  }
};
</script>
<style scoped>
.mx-10 {
  margin-right: 10rem;
  margin-left: 10rem;
}
.pagination-items {
  margin-top: 10rem;
}
.error-message {
  font-size: 0.875em;
  margin-bottom: 0.25rem;
}
</style>
