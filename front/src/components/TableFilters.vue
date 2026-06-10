<template>
  <div class="table-filters row items-center q-col-gutter-sm q-mb-md">
    <div class="col-12 col-sm">
      <q-input
        :model-value="search"
        :label="searchLabel"
        :placeholder="searchPlaceholder"
        outlined
        dense
        clearable
        debounce="400"
        @update:model-value="updateSearch"
        @clear="clearSearch"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <div v-if="showClear" class="col-12 col-sm-auto">
      <q-btn
        :label="clearLabel"
        icon="filter_alt_off"
        flat
        no-caps
        class="full-width"
        :disable="!hasFilters"
        @click="clearFilters"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  searchLabel: {
    type: String,
    default: 'Buscar'
  },
  searchPlaceholder: {
    type: String,
    default: ''
  },
  clearLabel: {
    type: String,
    default: 'Limpiar filtros'
  },
  showClear: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:search', 'change', 'clear'])

const hasFilters = computed(() => props.search.trim().length > 0)

function updateSearch(value) {
  const search = value || ''
  emit('update:search', search)
  emit('change', { search })
}

function clearSearch() {
  updateSearch('')
}

function clearFilters() {
  emit('clear')
  updateSearch('')
}
</script>
