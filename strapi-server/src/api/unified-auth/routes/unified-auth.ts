export default {
  routes: [
    {
      method: 'POST',
      path: '/unified-auth/login',
      handler: 'unified-auth.login',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/unified-auth',
      handler: 'unified-auth.info',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/unified-auth/test',
      handler: 'unified-auth.test',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};