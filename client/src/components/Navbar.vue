<template>
  <header>
    <nav class="navbar bg-white navbar-expand-lg navbar-light" id="main-nav">
      <div class="container">

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Ouvrir/Fermer la navigation">
          <BIconList/>
        </button>

        <router-link to="/" class="navbar-brand d-flex justify-content-center flex-column align-items-center mx-auto">
          <img src="../assets/svg/icon.svg" alt="Retour à l'accueil">
          <h1 v-if="isHome">Groupomania</h1>
          <p class="h1" v-else>Groupomania</p>
        </router-link>

        <div class="collapse navbar-collapse flex-wrap justify-content-end" id="navbarNav">
          <ul class="navbar-nav flex-lg-wrap justify-content-end" @click="this.collapse">
            <li v-if="isLoggedIn" class="nav-item">
              <router-link to="/" class="nav-link" aria-current="page">Fil d'actualité</router-link>
            </li>
            <li v-if="isLoggedIn" class="nav-item">
              <router-link :to="'/profile/' + currentUser.username" class="nav-link" aria-current="page">
                Mes partages
              </router-link>
            </li>
            <li v-if="isLoggedIn" class="nav-item">
              <router-link to="/account" class="nav-link" aria-current="page">Mon compte</router-link>
            </li>
            <li v-if="isLoggedIn && isAdmin" class="nav-item">
              <router-link to="/admin" class="nav-link" aria-current="page">Administration</router-link>
            </li>
          </ul>

          <form v-if="isLoggedIn" class="d-flex my-2" @submit.prevent.stop="onSearchSubmit">
            <input
              @click.prevent.stop
              v-model="username"
              name="username"
              id="search_username"
              class="form-control me-2"
              type="search"
              placeholder="Rechercher un utilisateur"
              aria-label="Rechercher un utilisateur"
            >
            <button class="btn btn-outline-primary" type="submit">Rechercher</button>
          </form>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import { Collapse } from 'bootstrap'

export default {
  name: 'Navbar',

  props: {
    isHome: Boolean
  },

  data () {
    return {
      username: ''
    }
  },

  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
      isAdmin: 'auth/isAdmin',
      currentUser: 'auth/currentUser'
    })
  },

  methods: {
    collapse () {
      if (window.innerWidth <= 992) {
        const collapse = new Collapse(document.getElementById('navbarNav'))
      }
    },

    async onSearchSubmit () {
      if (this.username) {
        await this.$router.push({ name: 'Search', params: { username: this.username } })
        this.username = ''
      }
    }
  }
}
</script>

<style scoped lang="scss">

@import '~bootstrap';

.navbar {

  box-shadow: rgba(0, 0, 0, 0.24) 0 3px 8px;

  &-toggler {
    position: absolute;
    left: 15px;
    top: 50px;
    height: 60px;
    font-size: 2rem;
  }

  .container {
    display: flex;
    justify-content: center;
  }

  &-brand {
    img {
      width: 90px;
      height: auto;
    }
  }

  hr {
    & ~ li {
      font-size: 0.8rem;
    }
  }

  li {
    &.btn {
      width: fit-content;
      margin: 5px 0;
    }
  }
}

@include media-breakpoint-up(lg) {
  form {
    width: 60%;
  }
}
</style>
