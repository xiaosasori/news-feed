import db from '~/plugins/firestore'

export const state = () => ({
  loading: false,
  token: '',
  headlines: [],
  category: '',
  country: 'us',
  user: null
})

export const mutations = {
  setHeadlines (state, headlines) {
    state.headlines = headlines
  },
  setCategory (state, category) {
    state.category = category
  },
  setLoading (state, loading) {
    state.loading = loading
  },
  setCountry (state, country) {
    state.country = country
  },
  setToken (state, token) {
    state.token = token
  },
  setUser (state, user) {
    state.user = user
  }
}

export const actions = {
  async loadHeadlines ({ commit }, apiUrl) {
    commit('setLoading', true)
    const { articles } = await this.$axios.$get(apiUrl)
    commit('setLoading', false)
    commit('setHeadlines', articles)
  },
  async authenticateUser ({ commit }, userPayload) {
    try {
      commit('setLoading', true)
      console.log('auth', userPayload)
      const authUserData = await this.$axios.$post(`/${userPayload.action}/`, {
        email: userPayload.email,
        password: userPayload.password,
        returnSecureToken: userPayload.returnSecureToken
      })
      let user
      if (userPayload.action === 'register') {
        const avatar = `http://gravatar.com/avatar/${authUserData.email}?d=identicon`
        user = { email: authUserData.email, avatar }
        await db.collection('users').doc(userPayload.email).set(user)
      } else {
        const loginRef = db.collection('users').doc(userPayload.email)
        const loggedInUser = await loginRef.get()
        user = loggedInUser.data()
      }
      console.log('user', authUserData)
      commit('setUser', user)
      commit('setToken', authUserData.idToken)
      commit('setLoading', false)
    } catch (err) {
      console.error('err', err)
      commit('setLoading', false)
    }
  }
}

export const getters = {
  isAuthenticated: state => !!state.token
}
