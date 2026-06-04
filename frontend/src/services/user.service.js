import api from './api';

const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  },

  async getAddresses() {
    const response = await api.get('/users/addresses');
    return response.data;
  },

  async addAddress(addressData) {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  },

  async updateAddress(id, addressData) {
    const response = await api.put(`/users/addresses/${id}`, addressData);
    return response.data;
  },

  async deleteAddress(id) {
    const response = await api.delete(`/users/addresses/${id}`);
    return response.data;
  },
};

export default userService;
