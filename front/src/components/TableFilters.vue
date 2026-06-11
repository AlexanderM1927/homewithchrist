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

    <div v-if="showSelect" class="col-12 col-sm-3">
      <q-select
        :model-value="selectValue"
        :options="selectOptions"
        :label="selectLabel"
        :placeholder="selectPlaceholder"
        outlined
        dense
        clearable
        emit-value
        map-options
        :loading="selectLoading"
        @update:model-value="updateSelect"
        @clear="clearSelect"
      >
        <template #prepend>
          <q-icon :name="selectIcon" />
        </template>
      </q-select>
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
  },
  selectValue: {
    type: [String, Number],
    default: null
  },
  selectOptions: {
    type: Array,
    default: () => []
  },
  selectLabel: {
    type: String,
    default: ''
  },
  selectPlaceholder: {
    type: String,
    default: ''
  },
  selectLoading: {
    type: Boolean,
    default: false
  },
  selectIcon: {
    type: String,
    default: 'person'
  }
})

const emit = defineEmits(['update:search', 'update:selectValue', 'change', 'clear'])

const showSelect = computed(() => props.selectOptions.length > 0 || props.selectLoading)
const hasSelectValue = computed(() => props.selectValue !== null && props.selectValue !== undefined && props.selectValue !== '')
const hasFilters = computed(() => props.search.trim().length > 0 || hasSelectValue.value)

function updateSearch(value) {
  const search = value || ''
  emit('update:search', search)
  emit('change', { search, selectValue: props.selectValue })
}

function clearSearch() {
  updateSearch('')
}

function updateSelect(value) {
  const selectValue = value || null
  emit('update:selectValue', selectValue)
  emit('change', { search: props.search, selectValue })
}

function clearSelect() {
  updateSelect(null)
}

function clearFilters() {
  emit('update:search', '')
  emit('update:selectValue', null)
  emit('clear')
  emit('change', { search: '', selectValue: null })
}
</script>
