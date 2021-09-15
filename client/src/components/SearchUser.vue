<template>
  <form action="#">
    <div class="input-group mb-3">
      <span class="input-group-text" aria-hidden="true"><BIconPeople/></span>
      <input type="text" class="form-control" id="username" title="Rechercher un utilisateur">
      <span class="btn-primary input-group-text"><button class="btn text-white"><BIconSearch/></button></span>
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
