import axiosInstance from './api'

const setup = (store) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const { accessToken } = JSON.parse(localStorage.getItem('user')) || {}

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  axiosInstance.interceptors.response.use(
    (res) => {
      return res
    },
    async (err) => {
      const originalConfig = err.config

      if (originalConfig.url !== '/auth/login' && err.response) {
        // 403: Forbidden access
        if (err.response && err.response.status === 403) {
          localStorage.removeItem('user')
          return Promise.resolve(false)
        }

        // 401: accessToken is probably expired, or the user isn't connected
        if (err.response && err.response.status === 401 && !originalConfig._retry) {
          originalConfig._retry = true

          const user = JSON.parse(localStorage.getItem('user')) || {}

          /* If the user is logged and his token is expired, try to reconnect it automatically with
          * the refresh token */
          if (user && user.refreshToken) {
            const rs = await axiosInstance.post('/auth/refresh-token', {
              refreshToken: JSON.parse(localStorage.getItem('user')).refreshToken
            }).catch((e) => {
              // We can't reconnect the user... just exit
              return Promise.resolve(false)
            })

            const { accessToken } = rs.data

            if (accessToken) {
              store.dispatch('auth/refreshToken', accessToken)
              return axiosInstance(originalConfig)
            }
          } else {
            localStorage.removeItem('user')
            return Promise.reject(err)
          }
        }
      }

      return Promise.reject(err)
    }
  )
}

export default setup
