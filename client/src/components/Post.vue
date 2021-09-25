<template>
  <div class="card mb-3 row g-0">
    <article tabindex="0" @click="onCardClick" class="col-12 card-body">
      <router-link
        @click="$event.stopImmediatePropagation()"
        class="h5 card-title"
        :to="{name: 'Profile', params: {username: this.$filters.striptags(author)}}"
        :title="'Voir le profil de ' + this.$filters.striptags(author)"
      >
        <!--    TODO: Quand on veut recharger les données a chaque changement de route, est-ce la bonne facon d'utiliser <a> au lieu de router-link ? -->
        {{ $filters.striptags(author) }}
      </router-link>

      <p class="card-subtitle card-createdat">{{ showDate }}</p>

      <p class="card-text mt-2">
        {{ $filters.striptags(this.post.content) }}

        <img v-if="this.post.media" class="post-media" :src="this.post.media" alt="">
      </p>

      <div class="card-text bottom-card d-flex justify-content-between align-items-center">
        <div class="card-bottom-left">
          <div class="position-relative">
            <a
              v-if="!isLikedByUser"
              href="#"
              title="Mettre un j'aime"
              @click.stop.prevent="$emit('increase-likes', $event, post.id)"
            >
              <BIconHeart/>
            </a>

            <a
              v-else
              href="#"
              title="Enlever mon j'aime"
              class="is-liked"
              @click.stop.prevent="$emit('decrease-likes', $event, post.id)"
            >
              <BIconHeartFill/>
            </a>

            <div class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
              {{ likesCount }} <span class="visually-hidden"> personnes aimes cet article</span>
            </div>
          </div>
        </div>

        <div class="position-relative card-bottom-right d-flex flex-row gap-3">

          <div v-if="!isOwner && !isAlreadyInUserFeed" class="card-share">
            <a
              href="#"
              class="text-black"
              title="Partager dans mon fil d'actualité"
              @click.prevent.stop="$emit('share-post', $event, post.id)"
            >
              <BIconShare/>
            </a>
          </div>

          <div v-else-if="!isOwner && isAlreadyInUserFeed" class="card-share">
            <a
              href="#"
              class="text-black"
              title="Ne plus partager cette publication"
              @click.prevent.stop="$emit('unshare-post', $event, post.id)"
            >
              <BIconShareFill/>
            </a>
          </div>

          <div v-if="!isSinglePage" class="card-comments">
            <BIconChatDots/>
            <div class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
              {{ commentsCount }} <span class="visually-hidden"> commentaires</span>
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="isOwner || isAdmin"
        @click.stop="$emit('delete-post', $event, this.post.id)"
        type="button"
        class="btn btn-primary btn-floating btn-delete"
        title="Supprimer la publication"
      >
        <BIconX/>
      </button>

      <button
        v-else
        @click.stop.prevent="onPostReport"
        type="button"
        class="btn btn-primary btn-floating btn-report"
        title="Signaler la publication"
      >
        <BIconExclamation/>
      </button>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import timeAgo from '@/services/timeAgo'
import postsApi from '@/api/posts'

export default {
  name: 'Post',

  data () {
    return {
      isSinglePage: false
    }
  },

  props: {
    post: {
      type: Object,
      default: () => {
      }
    }
  },

  computed: {

    ...mapGetters({
      isAdmin: 'auth/isAdmin'
    }),

    showDate () {
      if (this.$route.name === 'Profile' && this.post.Posts_Feeds && this.post.createdAt !== this.post.Posts_Feeds.createdAt) {
        return `Partagé ${timeAgo.format(new Date(this.post.Posts_Feeds.createdAt))}`
      }

      if (this.post.createdAt !== this.post.updatedAt) {
        return `Mis à jour ${timeAgo.format(new Date(this.post.updatedAt))}`
      }

      return `Posté ${timeAgo.format(new Date(this.post.createdAt))}`
    },

    author () {
      if (this.post.user && this.post.user.username) {
        return this.post.user.username
      }

      return 'Utilisateur supprimé'
    },

    likesCount () {
      return this.post.likes.length || 0
    },

    isOwner () {
      return this.post.userId === this.$store.state.auth.user.userId
    },

    isLikedByUser () {
      return this.post.likes.find((like) => like.userId === this.$store.state.auth.user.userId)
    },

    commentsCount () {
      return this.post.commentsCount || 0
    },

    isAlreadyInUserFeed () {
      return !!this.post.feeds.find((feed) => feed.userId === this.$store.state.auth.user.userId)
    }
  },

  methods: {
    onCardClick () {
      this.$router.push({ name: 'Single', params: { id: this.post.id } })
    },

    async onPostReport () {
      if (confirm('L\'administrateur sera notifié, souhaitez-vous signaler cette publication ?')) {
        try {
          await postsApi.postReport(this.post.id)
          alert('Publication signalée avec succès')
        } catch (e) {
          alert(e.data.message)
        }
      }
    }
  },

  created () {
    this.isSinglePage = this.$route.name === 'Single'
  }
}
</script>

<style scoped lang="scss">
article {
  cursor: pointer;
  transition: box-shadow 200ms;

  &:hover {
    transition: box-shadow 350ms;
    box-shadow: rgba(0, 0, 0, 0.16) 0 3px 6px, rgba(0, 0, 0, 0.23) 0 3px 6px;
  }

  .card-bottom-left {
    font-size: 1rem;

    .is-liked {
      color: #5089C6;
    }

    svg {
      font-size: 1.5rem;
      cursor: pointer;
      margin-right: 5px;

      &:hover {
        opacity: .65;
      }
    }

    .likes {
      margin-left: 10px;
    }
  }

  .card-bottom-right {
    svg {
      font-size: 1.5rem;
    }
  }

  .card-share {
    svg {
      &:hover {
        color: #0077cc;
      }
    }
  }

  .card-createdat {
    font-size: 0.825rem;
    margin-top: 3px;
  }

  .post-media {
    display: block;
    width: 100%;
    object-fit: contain;
    margin: 20px auto 20px auto;
    border-radius: 5px;
  }

  .bottom-card {
    margin-top: 30px;
  }

  .btn-delete,
  .btn-report {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
    opacity: 1;
    top: -10px;
    right: -10px;
    height: 30px;
    width: 30px;
    transition: opacity 100ms, transform 150ms;

    &:hover {
      transition: opacity 200ms ease-out, transform 300ms ease-out;
      transform: scale(1.5);
    }
  }

  .btn-delete {
    background: red;
    color: white;
    top: 0;
    right: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .btn-report {
    background: transparent;
    color: orange;
    top: 0;
    right: 0;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
