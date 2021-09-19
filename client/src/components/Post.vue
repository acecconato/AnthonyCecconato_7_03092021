<template>
  <div class="card mb-3 row g-0">
    <article tabindex="0" @click="onCardClick" class="col-12 card-body">
      <a class="h5 card-title" href="#">{{
          $filters.striptags(author)
        }}
      </a>

      <p class="card-subtitle card-createdat">{{ showDate }}</p>

      <p class="card-text mt-2">
        {{ $filters.striptags(this.post.content) }}

<!--        <img v-if="this.post.media" class="post-media" :src="this.post.media" alt="">-->
      </p>

      <div class="card-text bottom-card d-flex justify-content-between align-items-center">
        <div class="card-bottom-left">
          <div class="position-relative">
            <a v-if="!isLiked" href="#" title="Mettre un j'aime" @click.stop.prevent="likeClick($event, post.id)">
              <BIconHeart/>
            </a>

            <a v-else href="#" title="Enlever mon j'aime" class="is-liked"
               @click.stop.prevent="unlikeClick($event, post.id)">
              <BIconHeartFill/>
            </a>

            <div class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
              {{ nbLikes }} <span class="visually-hidden"> personnes aimes cet article</span>
            </div>
          </div>
        </div>

        <div class="position-relative card-bottom-right d-flex flex-row gap-3">

          <div class="card-share">
            <a href="#" class="text-black" title="Partager dans mon fil d'actualité" @click.prevent="shareClick">
              <BIconShare/>
            </a>
          </div>

          <div class="card-comments">
            <BIconChatDots/>
            <div class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
              {{ this.post.commentsCount }} <span class="visually-hidden"> commentaires</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import TimeAgo from 'javascript-time-ago'
import fr from 'javascript-time-ago/locale/fr'
import postsApi from '../api/posts'

TimeAgo.addDefaultLocale(fr)
const timeAgo = new TimeAgo('fr-FR')

export default {
  name: 'Post',

  data () {
    return {
      isLiked: false,
      nbLikes: 0
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
    showDate () {
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

    showNbLikes () {
      return 0
    }
  },

  methods: {
    onCardClick (e) {
      console.log('Outch')
    },

    likeClick () {
      this.isLiked = true
      this.nbLikes++
      postsApi.like(this.post.id)
    },

    unlikeClick () {
      this.isLiked = false
      this.nbLikes--
      postsApi.unlike(this.post.id)
    }
  },

  created () {
    const userId = this.$store.state.auth.user.userId
    this.nbLikes = this.post.likes.length

    this.isLiked = !!this.post.likes.find((like) => like.userId === userId)
  }
}
</script>

<style scoped lang="scss">
article {
  cursor: pointer;
  transition: box-shadow 200ms;

  &:hover {
    transition: box-shadow 350ms;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
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
}
</style>
