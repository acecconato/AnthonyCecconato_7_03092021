<template>
  <router-link :to="to" v-if="type === 'link'">{{ text }}</router-link>
  <a v-else :to="to" @click="$emit('button-click')" class="btn btn-groupomania">{{ text }}</a>
</template>

<script>
export default {
  name: 'Button',

  props: {
    text: String,
    to: String,
    type: { type: String, default: 'link' }
  }
}
</script>

<style scoped lang="scss">
.btn {
  &.btn-groupomania {
    background-color: #1899D6;
    border: solid transparent;
    border-radius: 16px;
    border-width: 0 0 4px;
    box-sizing: border-box;
    color: #FFFFFF;
    cursor: pointer;
    display: inline-block;
    font-family: din-round,sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: .5px;
    padding: 20px 10px;
    text-align: center;
    text-transform: uppercase;
    touch-action: manipulation;
    transform: translateZ(0);
    transition: filter .2s;
    user-select: none;
    -webkit-user-select: none;
    vertical-align: middle;
    white-space: nowrap;
    width: fit-content;

    &:after {
      background-clip: padding-box;
      background-color: #1CB0F6;
      border: solid transparent;
      border-radius: 16px;
      border-width: 0 0 4px;
      bottom: -4px;
      content: "";
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      z-index: -1;
    }

    &:main,
    &:focus {
      user-select: auto;
    }

    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    &:disabled {
      cursor: auto;
    }
  }

  &-primary {
    background: #1CB0F6;
    border-color: #1CB0F6;
  }
}
</style>
