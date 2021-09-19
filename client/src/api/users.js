import api from '../services/api'

export default {

  /**
   * Update user password
   * @param userId
   * @param currentPassword
   * @param newPassword
   * @return {Promise<any>}
   */
  async updatePassword (userId, currentPassword, newPassword) {
    try {
      const response = await api.post(`/users/${userId}/update-password`, {
        old_password: currentPassword,
        new_password: newPassword
      })

      return response.data
    } catch (e) {
      throw e.response
    }
  },

  /**
   * Export logged user's data in a csv format
   * @return {Promise<any>}
   */
  async exportMyData () {
    try {
      return await api.get('/gdpr/export-my-data', { responseType: 'blob' })
    } catch (e) {
      throw e.response
    }
  },

  /**
   * Delete a user account
   * @param userId
   * @return {Promise<AxiosResponse<any>>}
   */
  async deleteUser (userId) {
    try {
      return await api.delete(`/users/${userId}`)
    } catch (e) {
      throw e.response
    }
  }
}
