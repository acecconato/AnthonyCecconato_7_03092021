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
          <h1>Groupomania</h1>
        </router-link>

        <div @click="collapse" class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li v-if="isLoggedIn" class="nav-item">
              <router-link to="/" class="nav-link" aria-current="page">Fil d'actualité</router-link>
            </li>
            <li v-if="!isLoggedIn" class="nav-item">
              <router-link to="/login" class="nav-link" aria-current="page">Connexion</router-link>
            </li>
            <li v-if="isLoggedIn" class="nav-item">
              <router-link to="/profile" class="nav-link" aria-current="page">Mon compte</router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" aria-current="page" href="#">CGU</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" aria-current="page" href="#">Politique de confidentialité</a>
            </li>
          </ul>
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

  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
      currentUser: 'auth/currentUser'
    })
  },

  methods: {
    collapse () {
      const collapse = new Collapse(document.getElementById('navbarNav'))
    }
  }
}
</script>

<style scoped lang="scss">
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
}
</style>
