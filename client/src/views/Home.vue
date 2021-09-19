<template>
  <section class="container" id="actions">
    <div class="row pt-5 mt-4">
      <div class="col-12">
        <h2>Rechercher un utilisateur</h2>
        <SearchUser/>
      </div>
    </div>
  </section>

  <section class="container mt-4" aria-labelledby="feed-title">
    <h2 id="feed-title">Fil d'actualité</h2>

    <div class="mt-3 mb-5" id="add-posts">
      <AddPost @post-add="onPostAdd"/>
    </div>

    <div class="container mt-4">
      <infinite-scroll v-if="this.posts.length > 1" @infinite-scroll="loadMorePosts" :noResult="noResult" message="">
        <PostsList
          :no-result="noResult"
          :posts-length="posts.length"
          :posts="posts"
        />
      </infinite-scroll>

      <p v-else class="alert alert-info shadow-5 rounded-1">{{ this.loadingMessage }}</p>

    </div>

  </section>
</template>

<script>
import InfiniteScroll from 'infinite-loading-vue3'

import postsApi from '@/api/posts'
import SearchUser from '@/components/SearchUser'
import PostsList from '@/components/PostsList'
import AddPost from '@/components/AddPost'

export default {
  name: 'Home',
  components: {
    PostsList,
    SearchUser,
    InfiniteScroll,
    AddPost
  },

  data () {
    return {
      posts: [],
      size: 3,
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
      this.posts.unshift(post)
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
