<template>
  <div class="feed px-2">
    <ul>
      <li class="my-4 shadow-2-strong" v-for="(post, index) in posts" :key="index">
        <Post
          @delete-post="$emit('delete-post', $event, post.id)"
          @increase-likes="$emit('increase-likes', $event, post.id)"
          @decrease-likes="$emit('decrease-likes', $event, post.id)"
          @share-post="$emit('share-post', $event, post.id)"
          @unshare-post="$emit('unshare-post', $event, post.id)"
          :post="post" />
      </li>
    </ul>

    <p v-if="this.postsLength > 0 && this.noResult" role="alert">
      Il n y a plus de publications à afficher
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

  emits: [
    'delete-post',
    'increase-likes',
    'decrease-likes',
    'share-post',
    'unshare-post'
  ]
}
</script>

<style scoped lang="scss">
ul {
  list-style-type: none;
  padding-left: 0;
}
</style>
