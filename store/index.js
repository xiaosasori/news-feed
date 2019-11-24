import slugify from 'slugify'
import { saveUserData, clearUserData } from '~/utils'
import db from '~/plugins/firestore'

export const state = () => ({
  loading: false,
  token: '',
  headline: null,
  headlines: [],
  feed: [],
  category: '',
  country: 'us',
  user: null
})

export const mutations = {
  setHeadline (state, headline) {
    state.headline = headline
  },
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
  },
  setFeed (state, headlines) {
    state.feed = headlines
  },
  clearToken: state => (state.token = ''),
  clearUser: state => (state.user = null),
  clearFeed: state => (state.feed = [])
}

export const actions = {
  async loadHeadlines ({ commit }, apiUrl) {
    commit('setLoading', true)
    const { articles } = await this.$axios.$get(apiUrl)
    const headlines = articles.map((article) => {
      const slug = slugify(article.title, {
        replacement: '-',
        remove: /[^a-zA-Z0-9 -]/g,
        lower: true
      })
      return { ...article, slug }
    })
    commit('setLoading', false)
    commit('setHeadlines', headlines)
  },
  async authenticateUser ({ commit }, userPayload) {
    try {
      commit('setLoading', true)
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
      saveUserData(authUserData, user)
    } catch (err) {
      console.error('err', err)
      commit('setLoading', false)
    }
  },
  async addHeadlineToFeed ({ state }, headline) {
    console.log('addHeadlineToFeed', state.user.email, headline.title)
    const feedRef = db.collection(`users/${state.user.email}/feed`).doc(headline.title)
    await feedRef.set(headline)
  },
  async removeHeadlineFromFeed ({ state }, headline) {
    const headlineRef = db.collection(`users/${state.user.email}/feed`).doc(headline.title)
    await headlineRef.delete()
  },
  async loadUserFeed ({ state, commit }) {
    console.log('loadUserFeed')
    if (state.user) {
      console.log('loadUserFeed logged in')
      const feedRef = db.collection(`users/${state.user.email}/feed`)
      await feedRef.onSnapshot((querySnapshot) => {
        let headlines = []
        console.log('querySnapshot', querySnapshot)
        querySnapshot.forEach((doc) => {
          headlines.push(doc.data())
        })
        if (querySnapshot.empty) {
          headlines = []
        }
        commit('setFeed', headlines)
      })
    }
  },
  async saveHeadline ({ commit }, headline) {
    const headlineRef = db.collection('headlines').doc(headline.slug)
    let headlineId
    await headlineRef.get().then((doc) => {
      if (doc.exists) {
        headlineId = doc.id
      }
    })
    if (!headlineId) {
      await headlineRef.set(headline)
    }
  },
  async loadHeadline ({ commit }, headlineSlug) {
    const headlineRef = db.collection('headlines').doc(headlineSlug)
    await headlineRef.get().then((doc) => {
      if (doc.exists) {
        const headline = doc.data()
        commit('setHeadline', headline)
      }
    })
  },
  setLogoutTimer ({ dispatch }, interval) {
    setTimeout(() => dispatch('logoutUser'), interval)
  },
  logoutUser ({ commit }) {
    commit('clearToken')
    commit('clearUser')
    commit('clearFeed')
    clearUserData()
  }
}

export const getters = {
  isAuthenticated: state => !!state.token
}
