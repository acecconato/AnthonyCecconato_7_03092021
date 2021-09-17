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
  }
}
