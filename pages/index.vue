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
              :items="authors"
              :fields="authorsFields"
              selectable
              @row-clicked="authorRowClicked"
              v-b-modal.edit-author
            ></b-table>
          </div>
          <b-pagination
            class="justify-content-center mt-5"
            v-model="authorTable.currentPage"
            :total-rows="authorTable.rows"
            :per-page="authorTable.perPage"
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
              selectable
              @row-clicked="bookRowClicked"
              v-b-modal.edit-author
            ></b-table>
            <b-pagination
              class="justify-content-center mt-5"
              v-model="booksTable.currentPage"
              :total-rows="booksTable.rows"
              :per-page="booksTable.perPage"
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
        @ok="saveAuthor"
      >
        <div>
          <b-form>
            <b-form-group id="name-group" label="Name:" label-for="name">
              <b-form-input id="name" placeholder="Enter name" required v-model="author.name"></b-form-input>
            </b-form-group>
            <div class="my-4 d-flex justify-content-center">
              <b-button variant="outline-success" @click="toggleAddBook">Add Book</b-button>
            </div>
            <b-table
              id="author-books-table"
              striped
              hover
              :items="[...authorBooks, ...addedAuthorBooks]"
              :fields="bookFields"
              :isBusy="loadingAuthorBooks"
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
              v-model="authorTable.currentPage"
              :total-rows="authorTable.rows"
              :per-page="authorTable.perPage"
              aria-controls="author-books-table"
            ></b-pagination>
          </b-form>
        </div>
      </b-modal>
      <!-- -->

      <!-- Books Modal -->
      <b-modal v-model="bookModal.show" :id="bookModal.id" :title="bookModal.title" @cancel="resetBook" @ok="saveBook">
        <div>
          <b-form>
            <b-form-group id="title-group" label="Title:" label-for="title">
              <b-form-input id="title" placeholder="Enter book title" required v-model="book.title"></b-form-input>
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
    authorTable: {
      perPage: 25,
      currentPage: 1,
      rows: 30
    },
    booksTable: {
      perPage: 25,
      currentPage: 1,
      rows: 30
    },
    search: '',
    bookFields: ['title', 'author', 'isbn', 'pages', 'cost'],
    authorsFields: ['name', 'author_id', 'count'],
    author: {
      name: '',
      id: ''
    },
    authorBooks: [],
    books: [],
    addedAuthorBooks: [],
    name: '',
    book: {
      title: '',
      isbn: '',
      cost: '',
      year: '',
      pages: ''
    },
    loading: true,
    authorsActive: false,
    booksActive: false,
    authorModal: {
      selected: '',
      id: '',
      title: '',
      show: false
    },
    bookModal: {
      selected: '',
      id: '',
      title: '',
      action: null,
      show: false
    },
    loadingAuthorBooks: false,
    allBooks: []
  }),

  async mounted() {
    let { tab } = this.$route.query

    try {
      await this.setAuthStatus();
      await this.toggleTab(tab || 'authors');
    } catch (e) {
        await this.logout()
    }

  },

  computed: {
    ...mapState(['authors']),

    searchPlaceholder() {
      if (this.authorsActive) return "Search Author"
      return "Search Book"
    }
  },

  watch: {
    search(val) {
      if (this.authorsActive){
        this.allAuthors = this.authors.filter(value => value.name.toLowerCase().includes(val))
      }
    },
    authorsActive() {
      this.search = ''
    }
  },

  methods: {
    ...mapActions(['addBooks', 'addAuthor', 'getAuthStatus', 'getAuthors', 'getBooksByAuthor', 'getBooks']),

    ...mapMutations(['SET_USER', 'SET_SELECTED_AUTHOR']),

    async toggleTab(value) {
      if (value === 'books') {
        this.authorsActive = false;
        this.booksActive = true;
        await this.$router.push({ query: { tab: 'books' } })
        this.allBooks = await this.getBooks();
      }
      if (value === 'authors') {
        this.booksActive = false;
        this.authorsActive = true;
        await this.$router.push({ query: { tab: 'authors' } })
        await this.getAuthors();
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

    addAuthorBook() {
      this.authorBooks.push({ ...this.book, author: this.name });
      this.resetBook();
    },

    async saveAuthor() {
      try {
        const [first_name, last_name] = this.author.name.split(' ');
        const { author } = await this.addAuthor({
          first_name: first_name,
          last_name: last_name
        });

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

        if (books.length) {
          await this.addBooks({ author, books });
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

    resetItems() {
      this.items = [{}];
    },

    resetAuthor() {
      this.author.name = '';
    },

    cancel() {
      this.authorModal = {};
      this.resetItems();
      this.resetBook();
      this.resetAuthor();
      this.addedAuthorBooks = [];
      this.books = [];
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
        await this.$router.push('/login')
      }
      this.loading = false;
    },

    authorRowClicked(value, index) {
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

    saveBook() {
      this.addedAuthorBooks = [
        ...this.addedAuthorBooks,
        {
          ...this.book
        }
      ];
    },

    bookRowClicked(value, index) {
      this.book = {
        ...value
      };
      this.toggleEditBook();
    },

    async logout() {
      await this.$localforage.setItem('user', {});
      await this.$router.push('/login')
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
.page {
  background-image: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
  height: 100vh;
}
</style>
