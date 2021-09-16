<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container">

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded="false" aria-label="Ouvrir/Fermer la navigation">
        <BIconList/>
      </button>

      <router-link to="/" class="navbar-brand d-flex justify-content-center flex-column align-items-center mx-auto">
        <img src="../assets/svg/icon.svg" alt="">
        <h1>Groupomania</h1>
      </router-link>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
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
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Navbar',

  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn'
    }),

    getUrl () {
      console.log(this.$route.path)
      return true
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
    top: 23px;
    height: 60px;
  }

  .container {
    display: flex;
    justify-content: center;
  }

  &-brand {
    img {
      width: 90px;
      height: auto;
      background: grey;
    }
  }
}
</style>
