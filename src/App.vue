<script setup lang="ts">
import { ref } from 'vue'
import ChatWindow from './components/ChatWindow.vue'
import OutfitPage from './components/OutfitPage.vue'

const currentPage = ref<'chat' | 'outfit'>('chat')
</script>

<template>
  <ChatWindow v-if="currentPage === 'chat'" @navigate-outfit="currentPage = 'outfit'" />
  <OutfitPage v-else @close="currentPage = 'chat'" />
</template>
