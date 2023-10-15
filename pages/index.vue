<template>
  <div>
    <b-nav tabs align="center">
      <b-nav-item active>Authors</b-nav-item>
      <b-nav-item>Books</b-nav-item>
    </b-nav>
    <div>
      <b-form-input :id="`search`" type="search"></b-form-input>
    </div>
    <div>
      <div>
        <b-button variant="success" v-b-modal.add-author>Add Author</b-button>

        <b-modal id="add-author" title="Add Author" @cancel='cancel'>
          <div>
            <b-form>
              <b-form-group id="name-group" label="Name:" label-for="name">
                <b-form-input id="name" placeholder="Enter name" required v-model="name"></b-form-input>
              </b-form-group>
              <div class="my-4">
                <b-button variant="success" v-b-modal.add-book>Add Book</b-button>
              </div>
              <b-table striped hover :items="items" :fields="fields"></b-table>
            </b-form>
          </div>
        </b-modal>

        <b-modal id="add-book" title="Add Book" @ok="addBook" @cancel='resetBook'>
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
                <b-form-input id="year" placeholder="Enter name" v-model="book.year"></b-form-input>
              </b-form-group>
              <b-form-group id="cost-group" label="Cost:" label-for="cost">
                <b-form-input id="cost" placeholder="Cost" v-model="book.cost"></b-form-input>
              </b-form-group>
            </b-form>
          </div>
        </b-modal>
      </div>
    </div>
    <div>
      <div>
        <b-table striped hover :items="items" :fields="fields"></b-table>
      </div>
    </div>
  </div>
</template>
<script>
import Navbar from '~/components/navbar.vue';

export default {
  components: {
    Navbar
  },

  data: () => ({
    items: [{}],
    fields: ['title', 'author', 'isbn', 'pages', 'cost'],
    name: '',
    book: {
      title: '',
      isbn: '',
      cost: '',
      year: '',
      pages: ''
    }
  }),

  methods: {
    addBook() {
      this.items.push({ ...this.book, author: this.name });
      this.resetBook();
    },

    resetBook() {
      this.book = {
        title: '',
        isbn: '',
        cost: '',
        year: '',
        pages: ''
      }
    },

    resetItems() {
      this.items = [{}]
    },

    resetAuthor() {
      this.name = ''
    },

    cancel() {
      this.resetItems()
      this.resetBook()
      this.resetAuthor()
    }
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
