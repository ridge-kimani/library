<template>
  <div v-if='!loading'>
    <b-form @submit="submit" @reset="reset">
      <b-form-group
        id="input-username"
        label="Username:"
        label-for="input-username"
        description="We'll never share your email with anyone else."
      >
        <b-form-input id="input-1" v-model="username" type="text" placeholder="Enter username" required></b-form-input>
      </b-form-group>

      <b-form-group id="input-password-group" label="Password:" label-for="input-password">
        <b-form-input
          id="input-password"
          v-model="password"
          type="password"
          placeholder="Enter password"
          required
        ></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="primary">Submit</b-button>
      <b-button type="reset" variant="danger">Reset</b-button>
    </b-form>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';
export default {
  name: 'Login',

  data: () => ({
    username: '',
    password: '',
    error: {},
    loading: true
  }),

  async mounted() {
    this.loading = true

    try {
      const response = await this.$localforage.getItem('author') || {};
      if (response.token) {
        this.SET_USER(response);
        return this.$router.push('/');
      }
    } catch (e) {
       this.SET_USER({});
    }
    this.loading = false
  },

  methods: {
    ...mapActions(['login', 'getAuthStatus']),

    ...mapMutations(['SET_USER']),

    reset() {
      this.username = '';
      this.password = '';
    },

    async submit(event) {
      event.preventDefault();

      try {
        const response = await this.login({ username: this.username, password: this.password });
        await this.$localforage.setItem('author', response);
        return this.$router.push('/')
      } catch (e) {
        console.log({ e: e.toJSON() });
      }
    }
  }
};
</script>
<style scoped></style>
