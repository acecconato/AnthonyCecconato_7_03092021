<template>
  <form action="#">
    <div class="input-group mb-3">
      <span class="input-group-text"><BIconPeople/></span>
      <input name="username" type="text" class="form-control form-control-lg" placeholder="Nom d'utilisateur" aria-label="Nom d'utilisateur"/>
      <a class="btn btn-primary input-group-text"><BIconSearch/></a>
    </div>
  </form>
</template>

<script>
export default {
  name: 'SearchBar'
}
</script>

<style scoped lang="scss">

</style>
