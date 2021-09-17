<template>
  <div class="feed px-2">
    <ul>
      <li class="mb-4 shadow-3 shadow-3-strong" v-for="(post, index) in posts" :key="index">
        <TextPost :post="post" />
      </li>
    </ul>

    <p v-if="this.postsLength < 1" class="alert alert-warning">Il n y a pas encore d'articles</p>
    <p v-if="this.postsLength > 0 && this.noResult" class="alert alert-warning">Il n y a plus d'articles à charger</p>

  </div>
</template>

<script>
import TextPost from '../components/TextPost'

export default {
  name: 'PostsList',

  components: {
    TextPost
  },

  props: {
    posts: Array,
    postsLength: {
      type: Number,
      default: 0
    },
    noResult: Boolean
  }
}
</script>

<style scoped lang="scss">
ul {
  list-style-type: none;
  padding-left: 0;
}
</style>
