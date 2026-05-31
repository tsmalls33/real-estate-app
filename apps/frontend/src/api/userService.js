import { client } from './client';

export const userService = {
  getAll: async () => {
    const json = await client.get('/user');
    return json.data.users;
  },

  getMe: async () => {
    const json = await client.get('/user/me');
    return json.data;
  },
};
