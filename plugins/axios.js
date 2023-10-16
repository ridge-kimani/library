export default async function ({ $axios, store }) {
  $axios.onRequest((config) => {
    const token = store.state;
    console.log({ token });
    if (token) {
      config.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });
}
