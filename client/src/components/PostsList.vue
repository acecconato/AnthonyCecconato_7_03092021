<template>
  <div class="feed px-2">
    <ul>
      <li class="mb-4 shadow-3 shadow-3-strong" v-for="(post, index) in posts" :key="index">
        <Post @delete-post="$emit('delete-post', $event, post.id)" :post="post" />
      </li>
    </ul>

    <p v-if="this.postsLength > 0 && this.noResult" class="alert alert-info shadow-5 rounded-1">
      Fin du fil d'actualité<br >
      Il n y a plus de publications à charger
    </p>
  </div>
</template>

<script>
import Post from './Post'

export default {
  name: 'PostsList',

  components: {
    Post
  },

  props: {
    posts: Array,
    postsLength: {
      type: Number,
      default: 0
    },
    noResult: Boolean
  },

  methods: {
    test (...args) {
      console.log(args)
    }
  },

  emits: ['delete-post']
}
</script>

<style scoped lang="scss">
ul {
  list-style-type: none;
  padding-left: 0;
}
</style>
