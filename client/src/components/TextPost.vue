<template>
  <div class="card mb-3">
    <div class="row g-0">
      <div class="col-12">
        <div class="card-body">
          <h5 class="card-title">Par <a href="#">{{ username || 'Utilisateur introuvable' }}</a></h5>
          <p class="card-subtitle">{{ showDate }}</p>
          <p class="card-text mt-2">
            {{ truncatedContent }}
          </p>

          <div class="card-text bottom-card d-flex justify-content-between align-items-center">
            <div class="card-votes">
              <span :id="`upvote-${id}`">
                <BIconCaretUpSquare/>
              </span>
              22
              <span :id="`downvote-${id}`">
               <BIconCaretDownSquare/>
              </span>
            </div>
            <span class="card-comments"><BIconChatDots/>{{ commentsCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextPost',

  props: {
    textContent: String,
    username: String,
    date: String,
    id: Number,
    commentsCount: Number
  },

  computed: {
    truncatedContent () {
      if (this.textContent && this.textContent.length > 60) {
        return this.textContent.substring(0, 60) + '...'
      }

      return this.textContent || 'Contenu indisponible'
    },

    showDate () {
      return 'Il y a 3 jours'
    }
  }
}
</script>

<style scoped lang="scss">
.card-votes {
  font-size: 1rem;
  svg {
    font-size: 1.3rem;
    cursor: pointer;
  }
}

.card-comments {
  font-size: 1rem;

  svg {
    font-size: 1.3rem;
    margin-right: 5px;
  }
}
</style>
