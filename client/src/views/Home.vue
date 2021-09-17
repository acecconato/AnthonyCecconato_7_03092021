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

<!--    Todo post add form -->

    <div class="container mt-4">
      <infinite-scroll @infinite-scroll="loadMorePosts" :noResult="noResult" message="">
        <PostsList
          :no-result="noResult"
          :posts-length="posts.length"
          :posts="posts"
        />
      </infinite-scroll>
    </div>
  </section>
</template>

<script>
import InfiniteScroll from 'infinite-loading-vue3'

import postsApi from '../api/posts'
import SearchUser from '../components/SearchUser'
import PostsList from '../components/PostsList'

export default {
  name: 'Home',
  components: {
    PostsList,
    SearchUser,
    InfiniteScroll
  },

  data () {
    return {
      posts: [],
      size: 3,
      page: 0,
      noResult: false,
      message: ''
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
        this.message = 'Il n y a plus de publication à charger'
      }
    }
  },

  async created () {
    const posts = await postsApi.getPosts(this.page, this.size)
    this.totalPages = posts.totalPages
    this.posts = posts.rows
  }
}
</script>

<style scoped lang="scss">
.filters > a {
  margin: 0 5px;
}
</style>
