<template>
  <section class="container mt-5 py-4">
    <Button
      type="button"
      text="Revenir à la page précédente"
      classes="btn-dark mb-5"
      @button-click="this.$router.go(-1)"
    />

    <h1>Résultats pour "{{ username }}"</h1>

    <p v-if="!users || users.length < 1" class="alert alert-info mt-4">Oups... nous n'avons rien trouvé</p>

    <ul v-else class="row mt-4">
      <li
        v-for="(user, i) in users"
        :key="i"
        class="col-12">
        <router-link :to="{name: 'Profile', params: {username: user.username}}">
          {{ user.username }}
        </router-link>
      </li>
    </ul>

    <div v-if=errors class="col-12 form-group mt-3">
      <p v-for="(error, i) in errors" :key="i" class="alert alert-danger" role="alert">
        {{ error.message }}
      </p>
    </div>

  </section>
</template>

<script>
import Button from '@/components/Button'
import usersApi from '@/api/users'

export default {
  name: 'Search',

  components: {
    Button
  },

  data () {
    return {
      username: '',
      users: [],
      errors: false
    }
  },

  async created () {
    this.username = this.$route.params.username
    try {
      const response = await usersApi.searchByUsername(this.username)
      this.users = response.data
    } catch (e) {
      this.errors = e.data
    }
  },

  async beforeRouteUpdate (to) {
    this.username = to.params.username
    try {
      const response = await usersApi.searchByUsername(this.username)
      this.users = response.data
    } catch (e) {
      this.errors = e.data
    }
  }
}
</script>

<style scoped lang="scss">
ul {
  li {
    margin: 5px 0;
  }
}
</style>
