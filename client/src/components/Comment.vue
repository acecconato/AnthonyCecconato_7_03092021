<template>
  <div class="py-4 shadow-3-strong mb-4">
    <div class="col-12 comments-content">
      <h3 class="h5">{{ $filters.striptags(author) }}</h3>
      <p class="comments-createdAt">{{ showDate }}</p>
      <p class="comments-text">{{ $filters.striptags(comment.content) }}</p>
    </div>
    <div class="comments-report d-flex justify-content-end">
      <a href="#" v-if="isOwner" class="btn btn-link text-danger"
         @click.prevent.stop="$emit('delete-comment', this.comment.id)">Supprimer</a>
      <a href="#" v-else class="btn btn-link text-warning" @click.prevent.stop="onCommentReport">Signaler</a>
    </div>
  </div>

</template>

<script>
import timeAgo from '@/services/timeAgo'
import commentsApi from '@/api/comments'

export default {
  name: 'Comment',

  props: {
    comment: {
      type: Object,
      default: () => {
      }
    }
  },

  computed: {
    author () {
      return (this.comment.user) ? this.comment.user.username : ''
    },

    showDate () {
      if (this.comment.createdAt !== this.comment.updatedAt) {
        return `Mis à jour ${timeAgo.format(new Date(this.comment.updatedAt))}`
      }

      return `Posté ${timeAgo.format(new Date(this.comment.createdAt))}`
    },

    isOwner () {
      return this.comment.userId === this.$store.state.auth.user.userId
    }
  },

  methods: {
    async onCommentReport () {
      if (confirm('L\'administrateur sera notifié, souhaitez-vous signaler ce commentaire ?')) {
        try {
          await commentsApi.commentReport(this.comment.id)
          alert('Commentaire signalé avec succès')
        } catch (e) {
          alert(e.data.message)
        }
      }
    }
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

  &-report {
    text-align: right;
  }

  &-createdAt {
    font-size: 0.8rem;
  }
}
</style>
