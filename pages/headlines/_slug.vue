<template>
  <div class="md-layout md-alignment-center" style="margin: 5em 0">
    <md-card class="md-layout-item md-size-75 md-small-size-80 md-xsmalls-size-100" style="padding: 10px">
      <md-card-media style="height: 300px" md-ratio="16:9">
        <img :src="headline.urlToImage" :alt="headline.title">
      </md-card-media>
      <md-card-header>
        <div class="md-title">
          <a :href="headline.url" target="_blank">{{ headline.url }}</a>
        </div>
        <div>
          {{ headline.source.name }}
          <md-icon>book</md-icon>
        </div>
        <span class="md-subhead">
          {{ headline.author }}
          <md-icon>face</md-icon>
        </span>
      </md-card-header>
      <md-content>{{ headline.content }}</md-content>
    </md-card>
    <!-- Back button -->
    <md-button class="md-fab md-fab-bottom-right md-fixed md-primary" @click="$router.go(-1)">
      <md-icon>arrow_back</md-icon>
    </md-button>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  async fetch ({ store, params }) {
    await store.dispatch('loadHeadline', params.slug)
  },
  computed: {
    ...mapState(['headline'])
  }
}
</script>

<style>

</style>