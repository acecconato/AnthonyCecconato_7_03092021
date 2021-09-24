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
   * Get reported comments
   * @returns {Promise<any>}
   */
  async getReportedComments () {
    try {
      const response = await api.get('/comments/reports')
      return response.data
    } catch (e) {
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
  },

  /**
   * Delete comment reports
   * @param postId
   * @returns {Promise<AxiosResponse<any>>}
   */
  async deleteCommentReports (commentId) {
    try {
      return await api.delete(`/comments/${commentId}/reports`)
    } catch (e) {
      console.error(e.response)
      throw e.response
    }
  }
}
