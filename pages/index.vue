<template>
  <div class="page">
    <div v-if="!loading">
      <div class="mx-10 my-4 d-flex justify-content-between">
        <div v-if="authorsActive">
          <b-button variant="outline-success" @click="toggleAddAuthor">Add Author</b-button>
        </div>
        <div v-if="booksActive">
          <b-button variant="outline-success" @click="toggleAddBook">Add Book</b-button>
        </div>
        <div>
          <div>
            <b-form-input :id="`search`" type="search" :placeholder="searchPlaceholder" v-model="search"></b-form-input>
          </div>
        </div>
        <div>
          <b-button @click="logout" variant="outline-danger">Logout</b-button>
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
              selectable
              @row-clicked="authorRowClicked"
              v-b-modal.edit-author
              show-empty
              select-mode="single"
              :isBusy="loadingAuthors"
              :items="allAuthors"
              :fields="authorsFields"
              :per-page="authorTablePerPage"
              :current-page="authorTableCurrentPage"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
            >
              <template #empty="scope">
                <h6 class="text-secondary text-center">There are no authors found</h6>
              </template>
              <template #emptyfiltered="scope">
                <h6 class="text-secondary text-center">Author not found</h6>
              </template>
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
              v-b-modal.edit-book
              show-empty
            >
              <template #empty="scope">
                <h6 class="text-secondary text-center">There are no books found</h6>
              </template>
              <template #emptyfiltered="scope">
                <h6 class="text-secondary text-center">Book not found</h6>
              </template>
            </b-table>
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
        <template #modal-header="{ close }">
          <h5>{{ authorModal.title }}</h5>
          <b-button v-if="authorModal.id === 'edit-author'" size="sm" variant="danger" @click="onDeleteAuthor">
            Delete
          </b-button>
        </template>
        <div>
          <b-form ref="author-modal">
            <b-form-group id="name-group" label="Name:" label-for="name">
              <b-form-input id="name" placeholder="Enter name" required v-model="author.name"></b-form-input>
              <b-form-invalid-feedback v-if="formErrors.author.name" force-show>
                Enter the author name
              </b-form-invalid-feedback>
            </b-form-group>

            <div>
              <div class="my-4 d-flex" v-if="authorModal.id === 'add-author'">
                <b-button variant="outline-success" @click="toggleAddBook">Add Book</b-button>
              </div>
              <div v-if="formErrors.author.books" class="text-danger error-message">Add at least one book</div>
            </div>

            <b-table
              id="author-books-table"
              striped
              hover
              :items="allAuthorBooks"
              :fields="modalBookFields"
              :isBusy="loadingAuthorBooks"
              :total-rows="authorBooksRows"
              :per-page="authorBooksTablePerPage"
              :current-page="authorBooksCurrentPage"
              selectable
              @row-clicked="bookRowClicked"
              v-b-modal.edit-book
              show-empty
            >
              <template #empty="scope">
                <h6 class="text-secondary text-center">There are no books</h6>
              </template>
              <template #emptyfiltered="scope">
                <h6 class="text-secondary text-center">Book not found</h6>
              </template>
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
        @cancel="cancel"
        @close="cancel"
        @ok="handleBookOk"
      >
        <template #modal-header="{ close }">
          <h5>{{ bookModal.title }}</h5>

          <b-button v-if="bookModal.id === 'edit-book' && booksActive" size="sm" variant="danger" @click="onDeleteBook">
            Delete
          </b-button>
        </template>
        <div>
          <b-form ref="book-modal">
            <b-form-group id="title-group" label="Title:" label-for="title">
              <b-form-input id="title" placeholder="Enter book title" required v-model="book.title"></b-form-input>
              <b-form-invalid-feedback v-if="formErrors.books.title" force-show>
                Enter the book title
              </b-form-invalid-feedback>
            </b-form-group>
            <b-form-group id="author-select" label="Author:" label-for="author" v-if="booksActive">
              <treeselect v-model="book.author" :multiple="false" :options="options" />
              <b-form-invalid-feedback v-if="formErrors.books.author" force-show>
                Enter the author name
              </b-form-invalid-feedback>
            </b-form-group>
            <b-form-group id="isbn-group" label="Isbn:" label-for="isbn">
              <b-form-input id="isbn" v-model="book.isbn" placeholder="ISBN"></b-form-input>
            </b-form-group>
            <b-form-group id="pages-group" label="Pages:" label-for="pages">
              <b-form-input id="pages" placeholder="Pages" type="number" v-model="book.pages"></b-form-input>
            </b-form-group>
            <b-form-group id="group-year" label="Publish Year:" label-for="year">
              <b-form-input
                id="year"
                placeholder="Enter publish year"
                type="number"
                v-model="book.publish_year"
              ></b-form-input>
            </b-form-group>
            <b-form-group id="cost-group" label="Cost:" label-for="cost">
              <b-form-input id="cost" placeholder="Cost" type="number" v-model="book.cost"></b-form-input>
            </b-form-group>
          </b-form>
        </div>
      </b-modal>
      <!-- -->

      <!-- Delete Confirmation -->
      <b-modal
        id="delete-confirmation"
        v-model="deleteConfirmation.show"
        :id="deleteConfirmation.id"
        :title="deleteConfirmation.title"
        @cancel="deleteConfirmationClose"
        @close="deleteConfirmationClose"
        @ok="handleDelete"
      >
        <template #modal-footer="{ ok, cancel, hide }">
          <b-button size="sm" variant="secondary" @click="deleteConfirmationClose"> Cancel </b-button>
          <b-button size="sm" variant="danger" @click="handleDelete"> Delete </b-button>
        </template>
        <div>
          {{ deleteConfirmation.message }}
        </div>
      </b-modal>
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

    authorBooksTablePerPage: 3,
    authorBooksCurrentPage: 1,
    authorBooksRows: 1,

    booksTablePerPage: 10,
    booksTableCurrentPage: 1,
    booksTableRows: 1,

    // Search
    search: '',

    // Table
    bookFields: [
      { key: 'title', sortable: true },
      { key: 'author', sortable: true },
      { key: 'isbn', sortable: true },
      { key: 'publish_year', sortable: true },
      { key: 'pages', sortable: true },
      { key: 'cost', sortable: true }
    ],
    modalBookFields: [
      { key: 'title', sortable: true },
      { key: 'isbn', sortable: true },
      { key: 'pages', sortable: true }
    ],
    authorsFields: [{ key: 'name', sortable: true }, { key: 'author_id', sortable: true }, { key: 'count', sortable: true }],

    // Sort
    sortBy: null,
    sortDesc: false,

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
    options: [],

    deleteConfirmation: {
      selected: '',
      id: '',
      title: '',
      action: null,
      show: false
    },

    saveThenRedirect: false
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
        this.allAuthors = [...value];
        this.options =
          value.length &&
          value.map((val) => ({
            id: val.author_id,
            label: val.name
          }));
      }
    },

    books: {
      deep: true,
      handler(value, prev) {
        this.allBooks = [...value];
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
          this.formErrors.author.name = false;
        }
      }
    },

    'book.title': {
      handler(value) {
        if (value) {
          this.formErrors.books.title = false;
        }
      }
    },

    'book.author': {
      handler(value) {
        if (value) {
          this.formErrors.books.author = false;
        }
      }
    },
    'bookModal.show': {
      handler(value) {
        if (!value) {
          this.formErrors.books = {};
        }
      }
    },

    'authorModal.show': {
      handler(value) {
        if (!value) {
          this.formErrors.author = {};
        }
      }
    }
  },

  methods: {
    ...mapActions([
      'addBooks',
      'addAuthor',
      'getAuthStatus',
      'getAuthors',
      'getBooksByAuthor',
      'getBooks',
      'updateAuthor',
      'updateBooks',
      'deleteBook',
      'deleteAuthor'
    ]),

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
      return (this.bookModal = {
        selected: 'edit-book',
        id: 'edit-book',
        title: 'Edit Book',
        show: true
      });
    },

    checkAuthorForm() {
      let valid = this.$refs['author-modal'].checkValidity();

      const { selected } = this.authorModal;
      const books = selected === 'add-author' ? this.addedAuthorBooks : this.authorBooks;

      if (!valid) {
        this.formErrors.author = {
          name: true
        };
      }

      const hasBooks = books.filter((item) => item.title).length;

      if (!hasBooks) {
        this.formErrors.author = {
          ...this.formErrors.author,
          books: true
        };
        valid = false;
      }

      return valid;
    },

    checkBookForm() {
      let { author } = this.book;
      if (this.authorsActive) {
        author = true;
      }
      const valid = this.$refs['book-modal'].checkValidity() && author;
      if (!valid) {
        this.formErrors.books = {
          title: !this.book.title,
          author: !this.book.author
        };
      }
      return valid;
    },

    async handleBookOk(e) {
      e.preventDefault();
      const { selected } = this.bookModal;
      const { selected: selectedAuthor } = this.authorModal;
      if (!this.checkBookForm()) return false;

      this.resetFormErrors();

      const addedAuthorBooks = this.addedAuthorBooks;
      const authorBooks = this.authorBooks;

      if (this.authorsActive) {
        if (selected === 'add-book') {
          this.addedAuthorBooks = [
            ...addedAuthorBooks,
            {
              ...this.book
            }
          ];
          return (this.bookModal = {});
        }

        if (selected === 'edit-book' && selectedAuthor === 'add-author') {
          this.addedAuthorBooks[this.book.index] = this.book;
        }

        const updated = authorBooks.map((item) => {
          if (item.id === this.book.id) {
            return { ...this.book, update: true };
          }
          return item;
        });
        this.authorBooks = [...updated];
        return (this.bookModal = {});
      }

      if (this.booksActive) {
        if (selected === 'add-book') {
          return this.handleAddBooks();
        }
        if (selected === 'edit-book') {
          let id;
          if (typeof this.book.author === 'number') {
            id = this.book.author;
          } else {
            id = this.options.filter((option) => option.label === this.book.author)[0].id;
          }
          await this.updateBooks({
            books: [{ ...this.book, author_id: id }]
          });
          await this.getBooks();
          return (this.bookModal = {});
        }
      }
    },

    async handleAddBooks() {
      await this.addBooks({ author: { id: this.book.author }, books: [{ ...this.book }] });
      this.bookModal = {};
    },

    handleAuthorOk(e) {
      e.preventDefault();
      const valid = this.checkAuthorForm();
      if (!valid) return false;

      this.saveAuthor();
    },

    serializeBooks(state) {
      return state
        .filter((item) => item.title)
        .reduce((acc, value) => {
          if (!acc) acc = [];
          acc.push({
            ...value,
            title: value.title,
            isbn: value.isbn,
            cost: value.cost || 0,
            publish_year: value.publish_year || 0,
            pages: value.pages || 0,
            id: value.id,
            update: value.update
          });
          return acc;
        }, []);
    },

    async saveAuthor() {
      this.loadingAuthors = true;

      try {
        const [first_name, last_name] = this.author.name.split(' ');
        const { id } = this.authorModal;
        if (id === 'add-author') {
          const books = this.serializeBooks(this.addedAuthorBooks);
          const { author } = await this.addAuthor({
            first_name: first_name,
            last_name: last_name,
            count: books.length
          });

          if (books.length) {
            await this.addBooks({ author, books });
          }
          if (this.saveThenRedirect) {
            this.saveThenRedirect = false;
            this.authorModal = {};
            return await this.toggleTab('books');
          }
          return (this.authorModal = {});
        }

        if (id === 'edit-author') {
          const books = this.serializeBooks(this.authorBooks).filter((book) => book.update);
          const { author } = await this.updateAuthor({
            first_name,
            last_name,
            id: this.author.author_id,
            count: books.length
          });
          if (books.length) {
            await this.updateBooks({ books: books.map((book) => ({ ...book, author_id: author.id })) });
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
      this.resetFormErrors();
      this.authorModal = {};
      this.bookModal = {};
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
      if (!this.options.length && this.booksActive) {
        this.toggleTab('authors');
        this.saveThenRedirect = true;
        return this.toggleAddAuthor();
      }
      this.book = {};
      this.setBookModal({
        selected: 'add-book',
        id: 'add-book',
        title: 'Add Book',
        show: true
      });
    },

    onDeleteBook() {
      const message = `Are you sure you want to delete: ${this.book.title}?`;

      this.deleteConfirmation = {
        title: 'Delete Book',
        id: 'delete-book',
        selected: 'delete-book',
        show: true,
        message
      };
    },

    onDeleteAuthor() {
      const message = `Are you sure you want to delete: ${this.author.name}? This action will delete all related books.`;

      this.deleteConfirmation = {
        title: 'Delete Author',
        id: 'delete-author',
        selected: 'delete-author',
        show: true,
        message
      };
    },

    deleteConfirmationClose() {
      this.deleteConfirmation = {};
    },

    async handleDelete() {
      const { id } = this.deleteConfirmation;
      try {
        if (id === 'delete-author') {
          await this.deleteAuthor({
            author: {
              ...this.author,
              id: this.author.author_id
            }
          });
        }

        if (id === 'delete-book') {
          await this.deleteBook({
            author: {
              id: this.options.filter((option) => option.label === this.book.author)[0].id
            },
            book: {
              ...this.book
            }
          });
        }
        this.deleteConfirmationClose();
        this.authorModal = {};
        this.bookModal = {};
      } catch (e) {}
    },

    bookRowClicked(value, index) {
      this.book = {
        ...value,
        index
      };
      return this.toggleEditBook();
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
