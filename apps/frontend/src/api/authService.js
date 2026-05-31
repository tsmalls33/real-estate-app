import { client } from './client';

export const authService = {
  signin: async (email, password) => {
    const json = await client.post('/auth/signin', { email, password });
    return json.data;
  },

  signup: (form) => client.post('/auth/signup', form),
};
