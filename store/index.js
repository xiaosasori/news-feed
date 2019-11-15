import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: {
      loading: false,
      token: '',
      headlines: [],
      category: '',
      country: 'us'
    },
    mutations: {
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
      }
    },
    actions: {
      async loadHeadlines ({ commit }, apiUrl) {
        commit('setLoading', true)
        const { articles } = await this.app.$axios.$get(apiUrl)
        commit('setLoading', false)
        commit('setHeadlines', articles)
      },
      async authenticateUser ({ commit }, userPayload) {
        try {
          commit('setLoading', true)
          const authUserData = await this.$axios.$post('/register/', userPayload)
          console.log(authUserData)
          commit('setToken', authUserData.idToken)
          commit('setLoading', false)
        } catch (err) {
          console.error(err)
          commit('setLoading', false)
        }
      }
    },
    getters: {
      isAuthenticated: state => !!state.token
    }
  })
}

export default createStore
