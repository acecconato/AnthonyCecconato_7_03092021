<template>
  <div class="py-4 comments">
    <div class="col-12 comments-content">
      <h3 class="h5">
        <router-link
          @click="$event.stopImmediatePropagation()"
          class="h5 card-title"
          :to="{name: 'Profile', params: {username: this.$filters.striptags(author)}}"
          :title="'Voir le profil de ' + this.$filters.striptags(author)"
        >
          {{$filters.striptags(author) }}
        </router-link>
      </h3>
      <p class="comments-createdAt">{{ showDate }}</p>
      <p class="comments-text">{{ $filters.striptags(comment.content) }}</p>
    </div>
    <div class="comments-report d-flex justify-content-end">
      <a href="#" v-if="isOwner || isAdmin" class="btn btn-link text-danger"
         @click.prevent.stop="$emit('delete-comment', this.comment.id)">Supprimer</a>
      <a href="#" v-else class="btn btn-link text-warning" @click.prevent.stop="onCommentReport">Signaler</a>
    </div>
  </div>

</template>

<script>
import { mapGetters } from 'vuex'
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

    ...mapGetters({
      isAdmin: 'auth/isAdmin'
    }),

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

  &:nth-child(even) {
    background: rgb(255,255,255);
    background: linear-gradient(130deg, white 60%, #f4f4f4 100%);
  }

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
