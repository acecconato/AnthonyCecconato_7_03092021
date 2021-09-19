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
      console.error(e.response)
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
      console.error(e.response)
    }
  },

  async addPost (data) {
    try {
      const response = await api.post('/posts', {
        content: data.content,
        media: data.media
      })

      return response.data
    } catch (e) {
      console.error(e.response)
      throw e.response
    }
  },

  /**
   * Delete a post
   * @param postId
   * @return {Promise<AxiosResponse<any>>}
   */
  async deletePost (postId) {
    try {
      return await api.delete(`/posts/${postId}`)
    } catch (e) {
      console.error(e.response)
      throw e.response
    }
  }
}
