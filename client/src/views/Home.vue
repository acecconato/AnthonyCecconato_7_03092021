<template>
  <section class="container" id="actions">
    <div class="row mt-4">
      <div class="col-12">
        <h2>Rechercher un utilisateur</h2>
        <SearchUser/>
      </div>
    </div>
  </section>

  <section aria-labelledby="feed-title">
    <div class="container">
      <h2 class="container mt-5 section-title" id="feed-title">Fil d'actualité</h2>
      <Button class="mt-4" @button-click="postAdd" text="Ajouter une publication" type="button"/>
    </div>

    <div class="container mt-4 filters">
      <h3>Filtres</h3>
      <a aria-label="Tout afficher" class="btn btn-filter active">Tout</a>
      <a aria-label="Afficher seulement les gifs et images" class="btn btn-filter disabled">Gifs & images</a>
      <a aria-label="Afficher seulement les textes" class="btn btn-filter disabled">Textes</a>

      <PostsList :posts="posts" />

    </div>
  </section>
</template>

<script>
import SearchUser from '../components/SearchUser'
import Button from '../components/Button'
import PostsList from '../components/PostsList'

export default {
  name: 'Home',
  components: {
    PostsList,
    SearchUser,
    Button
  },

  data () {
    return {
      posts: []
    }
  },

  methods: {
    postAdd () {
      console.log('CLICKED')
    }
  },

  created () {
    this.posts = [
      {
        id: 1,
        textContent: 'TEST 01',
        username: 'John Doe',
        createdAt: 'Il y a 3 jours',
        commentsCount: 28
      },
      {
        id: 2,
        textContent: 'TEST 02',
        username: 'John Doe',
        createdAt: 'Il y a 3 jours',
        commentsCount: 10
      }
    ]
  }
}
</script>

<style scoped lang="scss">
.filters > a {
  margin: 0 5px;
}
</style>
