<template>
  <section class="container mt-5 py-4" aria-labelledby="feed-title">
    <h2 id="feed-title">Fil d'actualité</h2>

    <div class="mt-3 mb-5" id="add-posts">
      <AddPost @post-add="onPostAdd"/>
    </div>

    <div class="container mt-4">

      <p class="text-muted">Du plus récent au plus ancien</p>

      <infinite-scroll v-if="this.posts.length >= 1" @infinite-scroll="loadMorePosts" :noResult="noResult" message="">
        <PostsList
          :no-result="noResult"
          :posts-length="posts.length"
          :posts="posts"
          @delete-post="onPostDelete"
          @increase-likes="onIncreaseLikes"
          @decrease-likes="onDecreaseLikes"
          @share-post="onSharePost"
          @unshare-post="onUnsharePost"
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
import AddPost from '@/components/AddPost'

export default {
  name: 'Home',
  components: {
    PostsList,
    InfiniteScroll,
    AddPost
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

    async onIncreaseLikes (_, postId) {
      const response = await postsApi.like(postId)
      const like = response.data

      const index = this.posts.findIndex((post) => post.id === postId)
      this.posts[index].likes.push(like)
    },

    async onDecreaseLikes (_, postId) {
      await postsApi.unlike(postId)

      const index = this.posts.findIndex((post) => post.id === postId)
      this.posts[index].likes = this.posts[index].likes.filter((like) => like.userId !== this.$store.state.auth.user.userId)
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
    },

    async onUnsharePost (_, postId) {
      try {
        if (confirm('Souhaitez-vous enlever cette publication de votre profil ?')) {
          await postsApi.unsharePost(postId)
          const index = this.posts.findIndex((post) => post.id === postId)
          this.posts[index].feeds = this.posts[index].feeds.filter((feed) => feed.userId !== this.$store.state.auth.user.userId)
        }
      } catch (e) {
        alert(e.data.message)
      }
    }
  },

  async created () {
    const posts = await postsApi.getPosts(this.page, this.size)
    this.totalPages = posts.totalPages
    this.posts = posts.rows

    if (this.posts.length < 1) {
      this.loadingMessage = 'Il n y a pas encore de publications à afficher'
    }
  }
}
</script>

<style scoped lang="scss">
.filters > a {
  margin: 0 5px;
}
</style>
