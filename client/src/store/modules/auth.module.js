import auth from '../../api/auth'

let user
try {
  user = JSON.parse(localStorage.getItem('user'))
} catch (e) {
  user = null
}

const state = () => ((user) ? { status: { loggedIn: true }, user } : { status: { loggedIn: false }, user: {} })

const getters = {
  isLoggedIn: state => {
    return state.status.loggedIn
  },

  currentUser: state => {
    return state.user || {}
  },

  isAdmin: state => {
    return state.user.role === 'admin'
  }
}

const mutations = {
  loginSuccess (state, user) {
    state.status.loggedIn = true
    state.user = user
  },

  loginFailure (state) {
    state.status.loggedIn = false
    state.user = null
  },

  refreshToken (state, accessToken) {
    state.status.loggedIn = true
    state.user = { ...state.user, accessToken }
  },

  logout (state) {
    state.status.loggedIn = false
    state.user = null
  }
}

const actions = {
  async login ({ commit }, user) {
    try {
      const newUser = await auth.login(user)
      commit('loginSuccess', newUser)
      return true
    } catch (e) {
      commit('loginFailure')
      throw e
    }
  },

  async logout ({ commit }) {
    commit('logout')
    await auth.logout()
  },

  refreshToken ({ commit }, accessToken) {
    const user = JSON.parse(localStorage.getItem('user'))
    user.accessToken = accessToken
    localStorage.setItem('user', JSON.stringify(user))
    commit('refreshToken', accessToken)
    console.info('Access token updated, you can ignore the previous 401 error')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
