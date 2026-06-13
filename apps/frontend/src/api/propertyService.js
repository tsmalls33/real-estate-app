import { client } from './client';

export const propertyService = {
  getAll: async () => {
    const json = await client.get('/properties');
    return json.data.properties;
  }
};
