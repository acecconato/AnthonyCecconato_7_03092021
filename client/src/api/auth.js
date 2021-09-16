import api from '../services/api'

export default {
  async login (user) {
    try {
      const response = await api.post('auth/login', {
        username: user.username,
        password: user.password,
        remember: user.remember
      })

      if (response.data) {
        const { userId, accessToken, refreshToken, role, username, email } = response.data
        if (userId && accessToken && role && username && email) {
          const newUser = { userId, accessToken, refreshToken, role, username, email }
          localStorage.setItem('user', JSON.stringify(newUser))
          return newUser
        }
      }

      return response.data
    } catch (e) {
      throw e.response
    }
  },

  async signup (user) {
    try {
      const response = await api.post('auth/signup', {
        email: user.email,
        username: user.username,
        password: user.password
      })

      return response.data
    } catch (e) {
      throw e.response
    }
  },

  async logout () {
    try {
      await api.post('auth/logout')
    } catch (e) {
      console.error(e)
    }

    localStorage.removeItem('user')
  }
}
