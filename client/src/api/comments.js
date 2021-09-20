import api from '../services/api'

export default {

  /**
   * Delete a comment
   * @param commentId
   * @return {Promise<AxiosResponse<any>>}
   */
  async deleteComment (commentId) {
    try {
      return await api.delete(`/comments/${commentId}`)
    } catch (e) {
      console.error(e.response)
      throw e.response
    }
  },

  /**
   * Report a comment
   * @param commentId
   * @return {Promise<AxiosResponse<any>>}
   */
  async commentReport (commentId) {
    try {
      return await api.post(`/comments/${commentId}/reports`)
    } catch (e) {
      console.error(e.response)
      throw e.response
    }
  }
}
