<template>
  <section class="container">
    <h1>Connexion</h1>
    <form class="login-form row">
      <div class="mb-3">
        <label for="username" class="form-label">Nom d'utilisateur</label>
        <input type="text" class="form-control" id="username" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Mot de passe</label>
        <input type="password" class="form-control" id="password" required>
      </div>
      <div class="col-auto form-actions mt-4">
        <button type="submit" class="btn btn-primary mb-3">Connexion</button>
        <router-link to="/signup" class="btn btn-primary mb-3">Créer mon compte</router-link>
      </div>
    </form>
  </section>
</template>

<script>
export default {
  name: 'Login'
}
</script>

<style scoped lang="scss">
.container {
  margin-top: 50px;
  border: 1px solid #333;
  padding: 20px 10px;

  h1 {
    margin-bottom: 20px;
  }
}
</style>
