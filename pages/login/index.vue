<template>
  <b-container v-if="!loading" fluid class="vh-100">
    <b-row class="h-100">
      <b-col class="my-auto">
        <div class="text-center">Sign In</div>
        <b-form @submit="submit" class="mt-5">
          <b-form-group id="input-username" label="Username:" label-for="input-username">
            <b-form-input
              id="input-1"
              v-model="username"
              type="text"
              placeholder="Enter username"
              required
            ></b-form-input>
            <b-form-invalid-feedback :state="_get('error.field') === 'username'">
              {{ error.auth.field === 'username' ? error.auth.detail : '' }}
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group id="input-password-group" label="Password:" label-for="input-password">
            <b-form-input
              id="input-password"
              v-model="password"
              type="password"
              placeholder="Enter password"
              required
            ></b-form-input>
            <b-form-invalid-feedback :state="_get('error.field') === 'password'">
              {{ error.auth.field === 'password' ? error.auth.detail : '' }}
            </b-form-invalid-feedback>
          </b-form-group>

          <b-button type="submit" variant="success">Submit</b-button>
        </b-form>
      </b-col>
      <b-col>
        <div class="image-container">
          <img alt="" src="~/assets/library.png" class="img-fluid" />
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapActions, mapMutations, mapGetters, mapState } from 'vuex';
import { get } from 'lodash';

export default {
  name: 'Login',

  data: () => ({
    username: '',
    password: '',
    loading: true
  }),

  async mounted() {
    this.RESET_ERRORS();

    this.loading = true;

    try {
      const response = (await this.$localforage.getItem('user')) || {};
      if (response.token) {
        this.SET_USER(response);
        return this.$router.push('/');
      }
    } catch (e) {
      this.SET_USER({});
    }
    this.loading = false;
  },

  computed: {
    ...mapState(['error'])
  },

  methods: {
    ...mapActions(['login', 'getAuthStatus']),

    ...mapMutations(['SET_USER', 'RESET_ERRORS']),

    _get(obj, reference, fallback) {
      return get(obj, reference, fallback);
    },

    async submit(event) {
      event.preventDefault();
      this.RESET_ERRORS();

      try {
        const response = await this.login({ username: this.username, password: this.password });
        await this.$localforage.setItem('user', response);
        return this.$router.push('/');
      } catch (e) {
        return e;
      }
    }
  }
};
</script>
<style scoped>
.image-container {
  height: 100%;
  overflow: hidden;
}
.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
