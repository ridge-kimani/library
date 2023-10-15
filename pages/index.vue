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

        <b-modal id="add-author" title="Add Author">
          <div>
            <b-form>
              <b-form-group id="input-group-2" label="Name:" label-for="input-2">
                <b-form-input
                  id="input-2"
                  placeholder="Enter name"
                  required
                ></b-form-input>
              </b-form-group>

              <b-table striped hover :items="items" :fields="fields"></b-table>
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
    fields: ['name', 'author', 'isbn', 'pages', 'cost']
  })
};
</script>
