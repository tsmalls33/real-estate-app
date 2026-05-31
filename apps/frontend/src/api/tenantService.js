import { client } from './client';

export const tenantService = {
  getAll: async () => {
    const json = await client.get('/tenant');
    return json.data;
  },
};
