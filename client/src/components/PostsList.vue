<template>
  <div class="feed mt-4">
    <ul>
      <li v-for="post in posts" :key="post.id">
        <TextPost
          :id="post.id"
          :textContent="post.textContent"
          :username="post.username"
          :date="post.createdAt"
          :commentsCount="post.commentsCount"
        />
      </li>
    </ul>

    <Loading v-show="isLoading" />

  </div>
</template>

<script>
import TextPost from '../components/TextPost'
import Loading from '../components/Loading'

export default {
  name: 'PostsList',

  components: {
    TextPost,
    Loading
  },

  props: {
    posts: Array
  },

  data () {
    return {
      isLoading: false
    }
  }
}
</script>

<style scoped lang="scss">
ul {
  list-style-type: none;
  padding-left: 0;
}
</style>
