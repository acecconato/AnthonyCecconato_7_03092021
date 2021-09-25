<template>
  <router-link :to="to" v-if="type === 'link'">{{ text }}</router-link>
  <a href="#" v-else :to="to" @click.prevent="$emit('button-click')" :class="classes" class="btn">{{ text }}</a>
</template>

<script>
export default {
  name: 'Button',

  props: {
    text: String,
    to: String,
    type: { type: String, default: 'link' },
    classes: [String, Object, Array]
  }
}
</script>

<style scoped lang="scss">
.btn {
  font-size: 1rem;
  display: block;
  width: fit-content;
  margin-bottom: 8px;

  &:hover {
    box-shadow: rgb(204, 219, 232) 3px 3px 0 0 inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
  }

  &-primary {
    background: #1CB0F6;
    border-color: #1CB0F6;
  }
}
</style>
