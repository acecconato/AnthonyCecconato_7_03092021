import api from '../services/api'

export default {

  /**
   * Get all posts
   * @param page
   * @param size
   * @return {Promise<any>}
   */
  async getPosts (page = 0, size) {
    try {
      const response = await api.get('/posts', { params: { page, size } })
      return response.data
    } catch (e) {
      throw e.response
    }
  },

  /**
   * Like a post
   * @param postId
   * @return {Promise<void>}
   */
  async like (postId) {
    try {
      await api.post(`/posts/${postId}/likes`)
    } catch (e) {
      console.error(e)
    }
  },

  /**
   * Unlike a post
   * @param postId
   * @return {Promise<void>}
   */
  async unlike (postId) {
    try {
      await api.delete(`/posts/${postId}/likes`)
    } catch (e) {
      console.error(e)
    }
  }
}
