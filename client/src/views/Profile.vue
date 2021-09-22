<template>
  <section class="container pt-5 mt-4" aria-labelledby="feed-title">

    <Button type="button" text="Revenir sur la page d'accueil" classes="btn-dark mb-5" @button-click="this.$router.push('/')"/>

    <h2 v-if="isCurrentUserPage" id="feed-title">Vos publications partagées</h2>
    <h2 v-else id="feed-title">Publications partagées par {{ username }}</h2>

    <div class="container mt-4">

      <p class="text-muted">Partage du plus récent au plus ancien</p>

      <infinite-scroll v-if="this.posts.length >= 1" @infinite-scroll="loadMorePosts" :noResult="noResult" message="">
        <PostsList
          :no-result="noResult"
          :posts-length="posts.length"
          :posts="posts"
          @delete-post="onPostDelete"
          @increase-likes="onIncreaseLikes"
          @decrease-likes="onDecreaseLikes"
          @unshare-post="onUnsharePost"
          @share-post="onSharePost"
        />
      </infinite-scroll>

      <p v-else class="alert alert-info shadow-5 rounded-1">{{ this.loadingMessage }}</p>

    </div>

  </section>
</template>

<script>
import InfiniteScroll from 'infinite-loading-vue3'

import postsApi from '@/api/posts'
import PostsList from '@/components/PostsList'
import Button from '@/components/Button'

export default {
  name: 'Home',
  components: {
    PostsList,
    InfiniteScroll,
    Button
  },

  data () {
    return {
      posts: [],
      size: 6,
      page: 0,
      noResult: false,
      message: '',
      loadingMessage: 'Chargement en cours'
    }
  },

  computed: {
    username () {
      return this.$route.params.username
    },

    isCurrentUserPage () {
      return this.$route.params.username === this.$store.state.auth.user.username
    }
  },

  methods: {
    async loadMorePosts () {
      if (this.page < this.totalPages) {
        const newPosts = await postsApi.getPosts(++this.page, this.size)
        this.posts.push(...newPosts.rows)
        this.totalPages = newPosts.totalPages
      } else {
        this.noResult = true
        this.message = 'Il n y a plus de publications à charger...'
      }
    },

    onPostAdd (post) {
      this.posts = [post, ...this.posts]
    },

    async onPostDelete (e, postId) {
      try {
        if (confirm('Souhaitez-vous vraiment supprimer cette publication ?')) {
          await postsApi.deletePost(postId)
          this.posts = this.posts.filter((post) => post.id !== postId)
        }
      } catch (e) {
        alert(`Impossible de supprimer la publication : ${e.data.message}`)
      }
    },

    async onIncreaseLikes (e, postId) {
      const response = await postsApi.like(postId)
      const like = response.data

      const index = this.posts.findIndex((post) => post.id === postId)
      this.posts[index].likes.push(like)
    },

    async onDecreaseLikes (e, postId) {
      await postsApi.unlike(postId)

      const index = this.posts.findIndex((post) => post.id === postId)
      this.posts[index].likes = this.posts[index].likes.filter((like) => like.userId !== this.$store.state.auth.user.userId)
    },

    async initContent (username) {
      const posts = await postsApi.getFeedPosts(this.page, this.size, username)
      this.totalPages = posts.totalPages
      this.posts = posts.rows

      if (this.posts.length < 1) {
        this.loadingMessage = 'Il n y a pas encore de publications à afficher'
      }
    },

    async onUnsharePost (_, postId) {
      try {
        if (confirm('Souhaitez-vous enlever cette publication de votre profil ?')) {
          await postsApi.unsharePost(postId)
          const index = this.posts.findIndex((post) => post.id === postId)
          this.posts = this.posts.filter((post) => post.id !== postId)
        }
      } catch (e) {
        alert(e.data.message)
      }
    },

    async onSharePost (_, postId) {
      try {
        if (confirm('Souhaitez-vous partager cette publication ?')) {
          await postsApi.sharePost(postId)
          const index = this.posts.findIndex((post) => post.id === postId)
          this.posts[index].feeds.push({ userId: this.$store.state.auth.user.userId })
        }
      } catch (e) {
        alert(e.data.message)
      }
    }
  },

  async created () {
    this.initContent(this.$route.params.username)
  },

  async beforeRouteUpdate (to) {
    this.initContent(to.params.username)
  }
}
</script>
