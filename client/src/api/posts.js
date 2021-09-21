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
   * Get all posts related to a user's feed
   * @param page
   * @param size
   * @param username
   * @returns {Promise<any>}
   */
  async getFeedPosts (page = 0, size, username) {
    try {
      const response = await api.get(`/posts/${username}/feed`, { params: { page, size } })
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
      return await api.post(`/posts/${postId}/likes`)
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
  },

  /**
   * Get a post
   * @param postId
   * @return {Promise<any>}
   */
  async getPost (postId) {
    try {
      const response = await api.get(`/posts/${postId}`)
      return response.data
    } catch (e) {
      console.error(e.response)
      throw e.response
    }
  },

  /**
   * Add a post comment
   * @param postId
   * @param comment
   * @return {Promise<any>}
   */
  async addComment (postId, comment) {
    try {
      const response = await api.post('/comments', { postId, content: comment })
      return response.data
    } catch (e) {
      console.error(e.response)
      throw e.response
    }
  },

  /**
   * Get post comments
   * @param postId
   * @return {Promise<any>}
   */
  async getPostComments (postId) {
    try {
      const response = await api.get(`/posts/${postId}/comments`)
      return response.data
    } catch (e) {
      console.error(e.response)
      throw e.response
    }
  },

  /**
   * Report a post
   * @param postId
   * @return {Promise<void>}
   */
  async postReport (postId) {
    try {
      return await api.post(`/posts/${postId}/reports`)
    } catch (e) {
      console.error(e.response)
      throw e.response
    }
  }
}
