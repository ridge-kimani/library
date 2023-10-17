<template>
  <div v-if="!loading">
    <b-nav tabs align="center">
      <b-nav-item :active="authorsActive" @click="toggleTab('author')">Authors</b-nav-item>
      <b-nav-item :active="booksActive" @click="toggleTab('books')">Books</b-nav-item>
    </b-nav>
    <div>
      <b-form-input :id="`search`" type="search"></b-form-input>
    </div>
    <div v-if="authorsActive"a>
      <div>
        <b-button variant="success" @click="toggleAddAuthor">Add Author</b-button>
      </div>
      <div>
        <b-table
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
    </div>

    <div v-if="booksActive">
      <div>
        <b-button variant="success" @click="toggleAddBook">Add Book</b-button>
      </div>
      <div>
        <b-table
          striped
          hover
          select-mode="single"
          :items="allBooks"
          :fields="bookFields"
          selectable
          @row-clicked="bookRowClicked"
          v-b-modal.edit-author
        ></b-table>
      </div>
    </div>

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
          <div class="my-4">
            <b-button variant="success" v-b-modal.add-book>Add Book</b-button>
          </div>
          <b-table
            striped
            hover
            :items="[...authorBooks, ...addedAuthorBooks]"
            :fields="bookFields"
            :isBusy="loadingBooks"
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
        </b-form>
      </div>
    </b-modal>

    <b-modal v-model="bookModal.show" :id="bookModal.id" :title="bookModal.title" @cancel="resetBook">
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
    bookFields: ['title', 'author', 'isbn', 'pages', 'cost'],
    authorsFields: ['id', 'name', 'count'],
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
    loadingBooks: false,
    allBooks: []
  }),

  async mounted() {
    await this.setAuthStatus();
    await this.toggleTab('author')
  },

  computed: {
    ...mapState(['authors'])
  },

  methods: {
    ...mapActions(['addBooks', 'addAuthor', 'getAuthStatus', 'getAuthors', 'getBooksByAuthor', 'getBooks']),

    ...mapMutations(['SET_USER']),

    async toggleTab(value) {
      if (value === 'books') {
        this.authorsActive = false
        this.booksActive = true
        this.allBooks = await this.getBooks()
      }
      if (value === 'author') {
        this.booksActive = false
        this.authorsActive = true
        await this.getAuthors();

      }
    },

    toggleAddAuthor() {
      this.author = {}
      this.books = []
      this.addedAuthorBooks = []
      this.authorModal = {
        selected: 'add-author',
        id: 'add-author',
        title: 'Add Author',
        show: true
      };
    },

    toggleAddBook() {
      this.book = {}
      this.bookModal = {
        selected: 'add-book',
        id: 'add-book',
        title: 'Add Book',
        show: true
      };
    },

    async toggleEditAuthor() {
      this.authorBooks = [];
      this.authorModal = {
        selected: 'edit-author',
        id: 'edit-author',
        title: 'Edit Author',
        show: true
      };
      this.loadingBooks = true;
      const books = await this.getBooksByAuthor({ ...this.author });
      this.authorBooks = [...books];
      this.loadingBooks = false;
    },

    toggleEditBook() {
      this.bookModal = {
        selected: 'edit-book',
        id: 'edit-book',
        title: 'Edit Book',
        show: true
      }
    },

    addAuthorBook() {
      this.authorBooks.push({ ...this.book, author: this.name });
      this.resetBook();
    },

    async saveAuthor() {
      try {
        const [first_name, last_name] = this.name.split(' ');
        const { author } = await this.addAuthor({
          first_name: first_name,
          last_name: last_name
        });

        const books = this.items
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
      this.name = '';
    },

    cancel() {
      this.authorModal = {};
      this.resetItems();
      this.resetBook();
      this.resetAuthor();
      this.addedAuthorBooks = []
      this.books = []
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
      }
      this.loading = false;
    },

    authorRowClicked(value, index) {
      this.author = {
        ...value
      };
      this.toggleEditAuthor();
    },

    bookRowClicked(value, index) {
      this.book = {
        ...value
      }
      this.toggleEditBook()
    },

    editBook() {}
  },

  watch: {
    name: {
      handler(author) {
        this.items = this.items.map((item) => ({ ...item, author: item.title ? author : null }));
      }
    }
  }
};
</script>
