<template>
  <div>
    <b-nav tabs align="center">
      <b-nav-item active>Authors</b-nav-item>
      <b-nav-item>Books</b-nav-item>
    </b-nav>
    <div>
      <b-form-input :id="`search`" type="search"></b-form-input>
      <b-button variant="success">Add Author</b-button>
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
  }
}
</script>
