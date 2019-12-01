<template>
  <div class="md-layout md-alignment-center" style="margin: 4em 0">
    <!-- Top Navigation -->
    <md-toolbar class="fixed-toolbar" elevation="1">
      <md-button @click="showLeftSidepanel = true" class="md-icon-button">
        <md-icon>menu</md-icon>
      </md-button>
      <nuxt-link class="md-primary md-title" to="/">NuxtNews</nuxt-link>
      <div class="md-toolbar-section-end">
        <template v-if="isAuthenticated">
          <md-button>
            <md-avatar>
              <img :src="user.avatar" :alt="user.email" />
            </md-avatar>
            {{ user.email }}
          </md-button>
          <md-button @click="logoutUser">Logout</md-button>
        </template>
        <template v-else>
          <md-button @click="$router.push('/login')">login</md-button>
          <md-button @click="$router.push('/register')">register</md-button>
        </template>
        <md-button class="md-primary" @click="showSearchDialog=true">Search</md-button>
        <md-button class="md-accent" @click="showRightSidepanel=true">Categories</md-button>
      </div>
    </md-toolbar>
    <!-- Search Dialog -->
    <md-dialog :md-active.sync="showSearchDialog">
      <md-dialog-title>Search Headlines</md-dialog-title>
      <div class="md-layout" style="padding: 1em">
        <md-field>
          <label>Search Term(s)</label>
          <md-input
            v-model="query"
            placeholder="User quotes for exact matches, AND / OR / NOT for multiple terns"
            maxlength="30"
          ></md-input>
        </md-field>
        <md-datepicker v-model="fromDate">
          <label>Select starting date (optional)</label>
        </md-datepicker>
        <md-datepicker v-model="toDate">
          <label>Select ending date (optional)</label>
        </md-datepicker>
        <md-field>
          <label for="sortBy">Sort search results by criteria (optional)</label>
          <md-select v-model="sortBy" name="sortBy" id="sortBy" md-dense>
            <md-option value="publishedAt">Newest (default)</md-option>
            <md-option value="relevancy">Relevant</md-option>
            <md-option value="popularity">Popular</md-option>
          </md-select>
        </md-field>
      </div>
      <md-dialog-actions>
        <md-button class="md-accent" @click="showSearchDialog=false">Cancel</md-button>
        <md-button class="md-primary" @click="searchHeadlines">Search</md-button>
      </md-dialog-actions>
    </md-dialog>
    <!-- News feed drawer (left) -->
    <md-drawer class="md-right" md-fixed :md-active.sync="showLeftSidepanel">
      <md-toolbar md-elevation="1">
        <span class="md-title">Personal Feed</span>
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
      <!-- Default markup (if feed empty) -->
      <md-empty-state
        class="md-primary"
        v-if="feed.length === 0 && !user"
        md-icon="bookmarks"
        md-label="Nothing in Feed"
        md-description="Login to bookmark headlines"
      >
        <md-button class="md-primary md-raised" @click="$router.push('/login')">Login</md-button>
      </md-empty-state>
      <md-empty-state
        v-else-if="feed.length === 0"
        class="md-accent"
        md-icon="bookmark_outline"
        md-label="Nothing in Feed"
        md-description="Anything you bookmark will be safely stored here"
      ></md-empty-state>
      <!-- Default markup (if feed empty) -->
      <!-- Feed Content -->
      <md-list v-else class="md-triple-line" v-for="headline in feed" :key="headline.id">
        <md-list-item>
          <md-avatar>
            <img :src="headline.urlToImage" :alt="headline.title" />
          </md-avatar>
          <div class="md-list-item-text">
            <span>
              <a :href="headline.url" target="_blank">{{ headline.title }}</a>
            </span>
            <span>{{ headline.source.name }}</span>
            <span @click="saveHeadline(headline)">View Comments</span>
          </div>
          <md-button
            @click="removeHeadlineFromFeed(headline)"
            class="md-icon-button md-list-action"
          >
            <md-icon class="md-accent">delete</md-icon>
          </md-button>
        </md-list-item>
        <md-divider class="md-inset"></md-divider>
      </md-list>
      <!-- Feed Content -->
    </md-drawer>
    <!-- News feed drawer (left) -->
    <!-- Categories drawer (right) -->
    <md-drawer class="md-right" md-fixed :md-active.sync="showRightSidepanel">
      <md-toolbar :md-elevation="1">
        <span class="md-title">News Categories</span>
      </md-toolbar>
      <md-progress-bar v-if="loading" md-mode="indeterminate"></md-progress-bar>
      <md-list>
        <md-subheader class="md-primary">Categories</md-subheader>
        <md-list-item
          v-for="(newsCategory, index) in newsCategories"
          :key="index"
          @click="loadCategory(newsCategory.path)"
        >
          <md-icon
            :class="newsCategory.path === category ? 'md-primary' : ''"
          >{{ newsCategory.icon }}</md-icon>
          <span class="md-list-item-text">{{ newsCategory.name }}</span>
        </md-list-item>
      </md-list>
    </md-drawer>
    <!-- Categories drawer -->
    <!-- Top Navigation -->
    <md-content class="md-layout md-gutter" style="background: #007998; padding: 1em;">
      <ul
        v-for="(headline, index) in headlines"
        :key="index"
        class="md-layout-item md-large-size-25 md-medium-size-33 md-small-size-50 md-xsmall-size-100"
      >
        <md-card style="margin-top: 1em;" md-with-hover>
          <md-ripple>
            <md-card-media md-ratio="16:9">
              <img :src="headline.urlToImage" :alt="headline.title" />
            </md-card-media>
            <md-card-header>
              <div class="md-title">
                <a :href="headline.url" target="_blank">{{ headline.title }}</a>
              </div>
              <div @click="loadSource(headline.source.id)">
                {{ headline.source.name }}
                <md-icon class="small-icon">book</md-icon>
              </div>
              <div v-if="headline.author" class="md-subhead">
                {{ headline.author }}
                <md-icon class="small-icon">face</md-icon>
              </div>
              <div v-if="headline.author" class="md-subhead">
                {{ headline.publishedAt | publishedTimeToNow }}
                <md-icon class="small-icon">alarm</md-icon>
              </div>
            </md-card-header>
            <md-card-content>{{ headline.description }}</md-card-content>
            <md-card-actions>
              <md-button
                @click="addHeadlineToFeed(headline)"
                class="md-icon-button"
                :class="isInFeed(headline.title)"
              >
                <md-icon>bookmark</md-icon>
              </md-button>
              <md-button @click="saveHeadline(headline)" class="md-icon-button">
                <md-icon>message</md-icon>
              </md-button>
            </md-card-actions>
          </md-ripple>
        </md-card>
      </ul>
    </md-content>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
export default {
  data: () => ({
    showLeftSidepanel: false,
    showRightSidepanel: false,
    showSearchDialog: false,
    query: '',
    fromDate: '',
    toDate: '',
    sortBy: '',
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
    ...mapState(['loading', 'headlines', 'feed', 'category', 'country', 'user', 'source']),
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
    console.log('fetch index')
    await store.dispatch(
      'loadHeadlines',
      `/api/top-headlines?country=${store.state.country}&category=${store.state.category}`
    )
    await store.dispatch('loadUserFeed')
  },
  methods: {
    ...mapActions(['logoutUser']),
    async loadCategory (category) {
      this.$store.commit('setCategory', category)
      await this.$store.dispatch(
        'loadHeadlines',
        `/api/top-headlines?country=${this.country}&category=${this.category}`
      )
    },
    changeCountry (country) {
      this.$store.commit('setCountry', country)
    },
    async addHeadlineToFeed (headline) {
      if (this.user) {
        await this.$store.dispatch('addHeadlineToFeed', headline)
      }
    },
    isInFeed (title) {
      const inFeed = this.feed.findIndex(headline => headline.title === title) > -1
      return inFeed ? 'md-primary' : ''
    },
    async removeHeadlineFromFeed (headline) {
      await this.$store.dispatch('removeHeadlineFromFeed', headline)
    },
    async saveHeadline (headline) {
      await this.$store.dispatch('saveHeadline', headline).then(() => {
        this.$router.push(`/headlines/${headline.slug}`)
      })
    },
    async loadSource (sourceId) {
      if (sourceId) {
        this.$store.commit('setSource', sourceId)
        await this.$store.dispatch('loadHeadlines', `/api/top-headlines?sources=${this.source}`)
      }
    },
    async searchHeadlines () {
      await this.$store.dispatch('loadHeadlines', `/api/everything?q=${this.query}&from=${this.dateToISOString(this.fromDate)}&to=${this.toDate}&sortBy=${this.sortBy}`)
      this.showSearchDialog = false
    },
    dateToISOString (date) {
      if (date) {
        return new Date(date).toISOString()
      }
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
