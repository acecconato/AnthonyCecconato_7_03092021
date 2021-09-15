<template>
  <section class="container">
    <h1>Créer mon compte</h1>

    <p class="alert alert-info">Pour créer votre compte Groupomania, merci de remplir les champs suivants.</p>

    <form class="login-form row">
      <div class="mb-3">
        <label for="username" class="form-label">Nom d'utilisateur</label>
        <input type="text" class="form-control" id="username" required>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Adresse mail</label>
        <input type="text" class="form-control" id="email" required>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Mot de passe</label>
        <input type="password" class="form-control" id="password" required>
      </div>

      <div class="mb-3">
        <label for="password-validate" class="form-label">Répétez le mot de passe</label>
        <input type="password" class="form-control" id="password-validate" required>
      </div>

      <div class="col-auto form-actions mt-4">
        <router-link to="/login" class="btn btn-dark mb-3"><BIconArrowLeftCircle /> Retour</router-link>
        <button type="submit" class="btn btn-primary mb-3">Créer mon compte</button>
      </div>
    </form>
  </section>
</template>

<script>
export default {
  name: 'Signup'
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
