<template>
  <div class="md-layout md-alignment-center" style="margin: 5em 0">
    <div class="md-layout-item md-size-75 md-small-size-80 md-xsmalls-size-100">
      <md-card>
        <md-card-media style="height: 300px" md-ratio="16:9">
          <img :src="headline.urlToImage" :alt="headline.title" />
        </md-card-media>
        <md-card-header>
          <div class="md-title">
            <a :href="headline.url" target="_blank">{{ headline.url }}</a>
          </div>
          <div>
            {{ headline.source.name }}
            <md-icon>book</md-icon>
          </div>
          <span class="md-subhead" v-if="headline.author">
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
      <!-- Comment form -->
      <form @submit.prevent="sendComment">
        <md-field>
          <label>Enter your comment</label>
          <md-textarea v-model="text" :disabled="loading || !user"></md-textarea>
          <md-icon>description</md-icon>
        </md-field>
        <md-button
          class="md-primary md-raised"
          type="submit"
          :disabled="loading || !user"
        >Send comment</md-button>
      </form>
      <!-- Comment -->
      <md-list class="md-triple-line" style="margin-top: 1em">
        <md-list-item v-for="comment in headline.comments" :key="comment.id">
          <md-avatar>
            <img :src="comment.user.avatar" :alt="comment.user.username" />
          </md-avatar>
          <div class="md-list-item-text">
            <span>{{ comment.user.username }}</span>
            <span>{{ comment.user.publishedAt | commentTimeToNow }}</span>
            <p>{{ comment.text }}</p>
          </div>
          <md-badge class="md-primary" md-position="bottom" :md-content="comment.likes" />
          <md-button
            @click="likeComment(comment.id)"
            class="md-icon-button"
            :disabled="loading || !user"
          >
            <md-icon>thumb_up</md-icon>
          </md-button>
        </md-list-item>
      </md-list>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import uuid from 'uuid'
export default {
  data: () => ({
    text: ''
  }),
  async fetch ({ store, params }) {
    await store.dispatch('loadHeadline', params.slug)
  },
  computed: {
    ...mapState(['loading', 'headline', 'user'])
  },
  methods: {
    async sendComment () {
      const comment = {
        id: uuid(),
        text: this.text,
        user: this.getCommentUserData(),
        publishedAt: Date.now(),
        likes: 0
      }
      await this.$store.dispatch('sendComment', comment)
      this.text = ''
    },
    async likeComment (commentId) {
      await this.$store.dispatch('likeComment', commentId)
    },
    getCommentUserData () {
      const commentUserData = { ...this.user }
      commentUserData.username = commentUserData.email.split('@')[0]
      return commentUserData
    }
  }
}
</script>

<style>
</style>