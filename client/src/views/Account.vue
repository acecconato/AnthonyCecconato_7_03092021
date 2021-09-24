<template>
  <section class="container shadow-5 shadow-5-strong mt-5 py-5 px-4" aria-labelledby="main-title">

    <h1 id="main-title">Mon compte</h1>

    <h2 class="h4 mt-4">Mes informations</h2>
    <ul>
      <li>Nom d'utilisateur <span>{{ currentUser.username }}</span></li>
      <li>Adresse mail <span>{{ currentUser.email }}</span></li>
      <li>Role <span>{{ currentUser.role }}</span></li>
    </ul>

    <h2 class="h4 mt-4 mb-3">Que souhaitez-vous faire ?</h2>

    <p v-if="unknowError" class="alert alert-danger">Une erreur est survenue</p>

    <Button type="button" classes="btn-primary" @button-click="logoutClick" text="Me déconnecter"/>

    <!-- Update pasword component (form + modal) -->
    <UpdatePassword/>

    <Button type="button" classes="btn-primary" @button-click="exportDataClick" text="Exporter mes données"/>
    <Button type="button" classes="btn-outline-danger" @button-click="deleteAccountClick" text="Supprimer mon compte"/>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import fileDownload from 'js-file-download'

import Button from '@/components/Button'
import UpdatePassword from '@/components/UpdatePassword'
import usersApi from '@/api/users'

export default {
  name: 'Account',

  components: {
    Button,
    UpdatePassword
  },

  data () {
    return {
      unknowError: false
    }
  },

  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
      currentUser: 'auth/currentUser'
    })
  },

  methods: {
    async logoutClick () {
      try {
        await this.$store.dispatch('auth/logout')
        await this.$router.push('/')
      } catch (e) {
        console.error(e.data)
      }
    },

    async exportDataClick () {
      try {
        const response = await usersApi.exportMyData()
        fileDownload(response.data, `${this.currentUser.username}_data.csv`)
      } catch (e) {
        console.error(e.data)
        this.unknowError = true
      }
    },

    async deleteAccountClick () {
      if (window.confirm('Attention, vous êtes sur le point de supprimer votre compte. Cette action est irréversible. Souhaitez-vous tout de même continuer ?')) {
        try {
          await usersApi.deleteUser(this.currentUser.userId)
          await this.$store.dispatch('auth/logout')
          await this.$router.push('/')
        } catch (e) {
          console.error(e.data)
          this.unknowError = true
        }
      }
    }
  },

  mounted () {
    if (!this.currentUser) {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped lang="scss">
ul {
  list-style-type: none;
  padding-left: 0;
  margin-top: 15px;

  li {
    margin-bottom: 15px;
    font-size: 1.1rem;
    font-weight: 700;

    span {
      font-size: initial;
      display: block;
      font-weight: initial;
    }
  }
}
</style>
