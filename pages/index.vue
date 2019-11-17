<template>
  <div class="md-layout md-alignment-center" style="margin: 4em 0">
    <!-- Top Navigation -->
    <md-toolbar class="fixed-toolbar" elevation="1">
      <md-button @click="showLeftSidepanel = true" class="md-icon-button">
        <md-icon>menu</md-icon>
      </md-button>
      <nuxt-link class="md-primary md-title" to="/">
        NuxtNews
      </nuxt-link>
      <div class="md-toolbar-section-end">
        <template v-if="isAuthenticated">
          <md-button>
            <md-avatar><img :src="user.avatar" :alt="user.email"></md-avatar>
            {{ user.email }}
          </md-button>
          <md-button>Logout</md-button>
        </template>
        <template v-else>
          <md-button @click="$router.push('/login')">login</md-button>
          <md-button @click="$router.push('/register')">register</md-button>
        </template>
        <md-button class="md-accent" @click="showRightSidepanel=true">Categories</md-button>
      </div>
    </md-toolbar>
    <!-- News feed drawer (left) -->
    <md-drawer class="md-right" md-fixed :md-active.sync="showLeftSidepanel">
      <md-toolbar md-elevation="1">
        <span class="md-title">
          Personal Feed
        </span>
      </md-toolbar>
      <md-progress-bar v-if="loading" md-mode="indeterminate"></md-progress-bar>
      <md-field>
        <label for="country">Country</label>
        <md-select @input="changeCountry" :value="country" name="country" id="country">
          <md-option value="us">United States</md-option>
          <md-option value="ca">Canada</md-option>
          <md-option value="de">Germany</md-option>
          <md-option value="ru">Russia</md-option>
        </md-select>
      </md-field>
    </md-drawer>
    <!-- News feed drawer (left) -->
    <!-- Categories drawer (right) -->
    <md-drawer class="md-right" md-fixed :md-active.sync="showRightSidepanel">
      <md-toolbar :md-elevation="1">
        <span class="md-title">
          News Categories
        </span>
      </md-toolbar>
      <md-progress-bar v-if="loading" md-mode="indeterminate"></md-progress-bar>
      <md-list>
        <md-subheader class="md-primary">Categories</md-subheader>
        <md-list-item v-for="(newsCategory, index) in newsCategories" :key="index" @click="loadCategory(newsCategory.path)">
          <md-icon :class="newsCategory.path === category ? 'md-primary' : ''">{{ newsCategory.icon }}</md-icon>
          <span class="md-list-item-text">
            {{ newsCategory.name }}
          </span>
        </md-list-item>
      </md-list>
    </md-drawer>
    <!-- Categories drawer -->
    <!-- Top Navigation -->
    <md-content class="md-layout md-gutter" style="background: #007998; padding: 1em;">
      <ul v-for="(headline, index) in headlines" :key="index" class="md-layout-item md-large-size-25 md-medium-size-33 md-small-size-50 md-xsmall-size-100">
        <md-card style="margin-top: 1em;" md-with-hover>
          <md-ripple>
            <md-card-media md-ratio="16:9">
              <img :src="headline.urlToImage" :alt="headline.title">
            </md-card-media>
            <md-card-header>
              <div class="md-title">
                <a :href="headline.url" target="_blank">{{ headline.title }}</a>
              </div>
              <div>
                {{ headline.source.name }}
                <md-icon class="small-icon">
                  book
                </md-icon>
              </div>
              <div v-if="headline.author" class="md-subhead">
                {{ headline.author }}
                <md-icon class="small-icon">
                  face
                </md-icon>
              </div>
              <div v-if="headline.author" class="md-subhead">
                {{ headline.publishedAt }}
                <md-icon class="small-icon">
                  alarm
                </md-icon>
              </div>
            </md-card-header>
            <md-card-content>
              {{ headline.description }}
            </md-card-content>
            <md-card-actions>
              <md-button class="md-icon-button">
                <md-icon>
                  bookmark
                </md-icon>
              </md-button>
              <md-button class="md-icon-button">
                <md-icon>
                  message
                </md-icon>
              </md-button>
            </md-card-actions>
          </md-ripple>
        </md-card>
      </ul>
    </md-content>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  components: {},
  data: () => ({
    showLeftSidepanel: false,
    showRightSidepanel: false,
    newsCategories: [
      { name: 'Top Headlines', path: '', icon: 'today' },
      { name: 'Technology', path: 'technology', icon: 'keyboard' },
      { name: 'Business', path: 'business', icon: 'business_center' },
      { name: 'Entertainment', path: 'entertainment', icon: 'weekend' },
      { name: 'Health', path: 'health', icon: 'fastfood' },
      { name: 'Science', path: 'science', icon: 'fingerprint' },
      { name: 'Sports', path: 'sports', icon: 'golf_course' }
    ]
  }),
  // async asyncData ({ app }) {
  //   const topHeadlines = await app.$axios.$get('/api/top-headlines?country=us')
  //   return { headlines: topHeadlines.articles }
  // },
  computed: {
    ...mapState(['loading', 'headlines', 'category', 'country', 'user']),
    ...mapGetters(['isAuthenticated'])
  },
  watch: {
    async country () {
      await this.$store.dispatch(
        'loadHeadlines',
        `/api/top-headlines?country=${this.country}&category=${this.category}`
      )
    }
  },
  async fetch ({ store }) {
    console.log('fetch')
    await store.dispatch(
      'loadHeadlines',
      `/api/top-headlines?country=${store.state.country}&category=${store.state.category}`
    )
  },
  methods: {
    async loadCategory (category) {
      this.$store.commit('setCategory', category)
      await this.$store.dispatch(
        'loadHeadlines',
        `/api/top-headlines?country=${this.country}&category=${this.category}`
      )
    },
    changeCountry (country) {
      this.$store.commit('setCountry', country)
    }
  }
}
</script>

<style scoped>
.small-icon {
  font-size: 18px !important;
}
.fixed-toolbar {
  position: fixed;
  top: 0;
  z-index: 5;
}
</style>
