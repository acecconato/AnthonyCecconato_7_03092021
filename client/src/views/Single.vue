<template>
  <section class="container pt-5 mt-4" aria-labelledby="feed-title">
    <div class="container mt-4 ">
      <Button type="button" text="Retour" classes="btn-dark mb-5" @button-click="this.$router.go(-1)"/>
      <Post
        class="shadow-3 shadow-3-strong"
        @delete-post="onPostDelete"
        @increase-likes="onIncreaseLikes"
        @decrease-likes="onDecreaseLikes"
        v-if="this.post"
        :post="this.post"
      />

      <section class="mt-3 py-4" aria-labelledby="comments-title">
        <div class="comments-title d-flex justify-content-between">
          <h2 id="comments-title">Commentaires</h2>

          <div class="comments-title">
            <BIconChatDots/>
            <div class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
               {{ showCommentsCount }} <span class="visually-hidden"> commentaires</span>
            </div>
          </div>
        </div>
      </section>

      <div class="row">
        <Comment v-for="(comment, i) in this.comments" :key="i" :comment="comment" @delete-comment="onDeleteComment"/>
      </div>

      <div v-if=errors class="col-12 form-group mt-3">
        <p v-for="(error, i) in errors" :key="i" class="alert alert-danger" role="alert">
          {{ error.message }}
        </p>
      </div>

      <AddComment @add-comment="onAddComment" />
    </div>

  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import Post from '@/components/Post'
import Comment from '@/components/Comment'
import Button from '@/components/Button'
import AddComment from '@/components/AddComment'
import postsApi from '@/api/posts'
import commentsApi from '@/api/comments'

export default {
  name: 'Single',

  components: {
    Post,
    Comment,
    Button,
    AddComment
  },

  data () {
    return {
      postId: this.$route.params.id,
      post: undefined,
      comments: [],
      errors: false
    }
  },

  computed: {
    ...mapGetters({
      isAdmin: 'auth/isAdmin'
    }),

    showCommentsCount () {
      return this.comments.length
    }
  },

  methods: {
    async getPostDatas (postId) {
      try {
        return await postsApi.getPost(postId)
      } catch (e) {
        await this.$router.push('/')
      }
    },

    async onPostDelete (e, postId) {
      try {
        if (confirm('Souhaitez-vous vraiment supprimer cette publication ?')) {
          await postsApi.deletePost(postId)
          await this.$router.push('/')
        }
      } catch (e) {
        alert(e.data)
      }
    },

    async onIncreaseLikes () {
      const response = await postsApi.like(this.post.id)
      this.post.likes.push(response.data)
    },

    async onDecreaseLikes () {
      await postsApi.unlike(this.post.id)
      this.post.likes = this.post.likes.filter((like) => like.userId !== this.$store.state.auth.user.userId)
    },

    async onAddComment ({ content }) {
      try {
        const response = await postsApi.addComment(this.post.id, content)
        this.comments.push(response)
      } catch (e) {
        console.error(e.data)
        this.errors = e.data
      }
    },

    async onDeleteComment (commentId) {
      try {
        if (confirm('Souhaitez-vous vraiment supprimer ce commentaire ?')) {
          await commentsApi.deleteComment(commentId)
          this.comments = this.comments.filter((comment) => comment.id !== commentId)
        }
      } catch (e) {
        alert(e.data.message)
      }
    }
  },

  async created () {
    this.post = await this.getPostDatas(this.postId)
    this.comments = await postsApi.getPostComments(this.post.id)
  }
}
</script>

<style scoped lang="scss">
.comments {
  &-title {
    position: relative;

    svg {
      font-size: 1.8rem;
    }
  }
}
</style>
