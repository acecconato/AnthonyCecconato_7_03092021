<template>
  <section class="container mt-5 py-4" aria-labelledby="section-title">
    <h1 id="section-title">Administration</h1>

    <section class="mt-5">
      <h2>Publications signalées</h2>

      <div v-if=errors class="form-group mt-3">
        <p v-for="(error, i) in errors" :key="i" class="alert alert-danger" role="alert">
          {{ error.message }}
        </p>
      </div>

      <p class="text-muted">Trié par nombre de signalement décroissant</p>

      <p v-if="!this.posts || this.posts.length < 1" class="alert alert-info">Pas de publications signalées</p>
      <div v-else class="table-responsive">
        <table class="table">
          <thead>
          <tr>
            <th scope="col">SIGNALEMENTS</th>
            <th scope="col">CONTENU</th>
            <th scope="col">AUTEUR</th>
            <th scope="col">ACTIONS</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(post, i) in posts" :key="i">
            <td class="reports">{{ post.nbReports }}</td>
            <td class="content">{{ post.content }}</td>
            <td class="author">
              <a href="#" @click.prevent.stop="onAuthorClick(post.user.username)">
                {{ post.user.username }}
              </a>
            </td>
            <td class="actions">
              <a
                href="#"
                title="Ouvrir la publication dans un nouvel onglet"
                target="_blank"
                class="btn btn-outline-primary"
                @click.stop.prevent="onPostViewClick(post.id)"
              >
                <BIconBoxArrowUpRight/>
              </a>

              <a
                href="#"
                title="Valider la publication"
                class="btn btn-outline-success"
                @click.stop.prevent="onPostValidateClick(post.id)"
              >
                <BIconCheckSquare/>
              </a>

              <a
                href="#"
                title="Supprimer la publication"
                class="btn btn-outline-danger"
                @click.stop.prevent="onPostDeleteClick(post.id)"
              >
                <BIconTrash2/>
              </a>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-5">
      <h2>Commentaires signalées</h2>

      <div v-if=errors class="form-group mt-3">
        <p v-for="(error, i) in errors" :key="i" class="alert alert-danger" role="alert">
          {{ error.message }}
        </p>
      </div>

      <p class="text-muted">Trié par nombre de signalement décroissant</p>

      <p v-if="!this.comments || this.comments.length < 1" class="alert alert-info">Pas de commentaires signalées</p>
      <div v-else class="table-responsive">
        <table class="table">
          <thead>
          <tr>
            <th scope="col">SIGNALEMENTS</th>
            <th scope="col">CONTENU</th>
            <th scope="col">AUTEUR</th>
            <th scope="col">ACTIONS</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(comment, i) in comments" :key="i">
            <td class="reports">{{ comment.nbReports }}</td>
            <td class="content">{{ comment.content }}</td>
            <td class="author">
              <a href="#" @click.prevent.stop="onAuthorClick(comment.user.username)">
                {{ comment.user.username }}
              </a>
            </td>
            <td class="actions">
              <a
                href="#"
                title="Valider le commentaire"
                class="btn btn-outline-success"
                @click.stop.prevent="onCommentValidateClick(comment.id)"
              >
                <BIconCheckSquare/>
              </a>

              <a
                href="#"
                title="Supprimer le commentaire"
                class="btn btn-outline-danger"
                @click.stop.prevent="onCommentDeleteClick(comment.id)"
              >
                <BIconTrash2/>
              </a>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>

  </section>

</template>

<script>
import postsApi from '@/api/posts'
import commentsApi from '@/api/comments'

export default {
  name: 'Admin',

  data () {
    return {
      posts: [],
      comments: [],
      errors: false
    }
  },

  methods: {
    async initContent () {
      try {
        this.posts = await postsApi.getReportedPosts()
        this.comments = await commentsApi.getReportedComments()
      } catch (e) {
        this.errors = e.data
      }
    },

    onPostViewClick (postId) {
      const routeData = this.$router.resolve({ name: 'Single', params: { id: postId } })
      window.open(routeData.href, '_blank')
    },

    async onPostValidateClick (postId) {
      try {
        await postsApi.deletePostReports(postId)
        this.posts = this.posts.filter((post) => post.id !== postId)
      } catch (e) {
        this.errors = e.data
      }
    },

    async onPostDeleteClick (postId) {
      try {
        await postsApi.deletePost(postId)
        this.posts = this.posts.filter((post) => post.id !== postId)
      } catch (e) {
        this.errors = e.data
      }
    },

    async onCommentValidateClick (commentId) {
      try {
        await commentsApi.deleteCommentReports(commentId)
        this.comments = this.comments.filter((comment) => comment.id !== commentId)
      } catch (e) {
        this.errors = e.data
      }
    },

    async onCommentDeleteClick (commentId) {
      try {
        await commentsApi.deleteComment(commentId)
        this.comments = this.comments.filter((comment) => comment.id !== commentId)
      } catch (e) {
        this.errors = e.data
      }
    },

    async onAuthorClick (username) {
      const routeData = this.$router.resolve({ name: 'Profile', params: { username } })
      window.open(routeData.href, '_blank')
    }
  },

  async created () {
    if (this.$store.state.auth.user.role !== 'admin') {
      await this.$router.push('/')
    }

    await this.initContent()
  }
}
</script>

<style scoped lang="scss">
h2 {
  width: fit-content;
}

tr {
  vertical-align: middle;
}

.table-responsive {
  max-height: 750px;
}

.actions {

  a {
    display: inline-block;
    margin: 5px auto;
  }

  svg {
    display: inline-block;
    font-size: 1rem;
  }
}
</style>
