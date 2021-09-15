<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container">

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded="false" aria-label="Ouvrir/Fermer la navigation">
        <span @click="toggleToggler" v-if="isToggleOpen === false">
          <BIconList />
        </span>
        <span @click="toggleToggler" v-else>
          <BIconXLg />
        </span>
      </button>

      <a class="navbar-brand d-flex justify-content-center flex-column align-items-center mx-auto" href="#">
        <img src="../assets/svg/icon.svg" alt="">
        <h1 v-if="isHome">Groupomania</h1>
        <h2 class="h1" v-else>Groupomania</h2>
<!--        todo do not change -->
      </a>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/" class="nav-link" aria-current="page">Fil d'actualité</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/login" class="nav-link" aria-current="page">Connexion</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" aria-current="page" href="#">Mentions légales</a>
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
export default {
  name: 'Navbar',

  data () {
    return {
      isToggleOpen: false
    }
  },

  methods: {
    toggleToggler () {
      this.isToggleOpen = !this.isToggleOpen
    }
  }
}
</script>

<style scoped lang="scss">
.navbar {

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;

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
