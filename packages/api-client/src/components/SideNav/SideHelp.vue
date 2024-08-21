<script setup lang="ts">
import { useWorkspace } from '@/store/workspace'
import {
  ScalarButton,
  ScalarDropdown,
  ScalarDropdownDivider,
  ScalarDropdownItem,
  ScalarIcon,
} from '@scalar/components'

const { activeWorkspace } = useWorkspace()
</script>
<template>
  <ScalarDropdown
    class="max-w-[150px]"
    :placement="'top-end'">
    <button
      class="min-w-[37px] max-w-[42px] hover:bg-b-3 flex items-center justify-center rounded-lg p-[7px] text-c-3 focus:text-c-1 scalar-app-nav-padding"
      type="button">
      <ScalarIcon
        icon="Help"
        thickness="1.5" />
    </button>

    <!-- Workspace list -->
    <template #items>
      <router-link
        class="no-underline"
        :to="`/workspace/${activeWorkspace.uid}/settings/general`">
        <ScalarDropdownItem class="flex items-center gap-1.5 w-full">
          <div class="flex items-center justify-center">
            <ScalarIcon
              icon="Settings"
              size="xs"
              thickness="1.75" />
          </div>
          <span>Settings</span>
        </ScalarDropdownItem>
      </router-link>
      <span class="px-2.5 py-1.5 text-xs text-c-2 font-medium">Support</span>
      <a
        class="no-underline block"
        href="https://discord.gg/scalar"
        target="_blank">
        <ScalarDropdownItem class="flex items-center gap-1.5 w-full">
          <div class="flex items-center justify-center">
            <ScalarIcon
              icon="DiscordLine"
              size="xs"
              thickness="1.75" />
          </div>
          <span>Discord</span>
        </ScalarDropdownItem>
      </a>
      <a
        class="no-underline block"
        href="https://github.com/scalar/scalar"
        target="_blank">
        <ScalarDropdownItem class="flex items-center gap-1.5 w-full">
          <div class="flex items-center justify-center">
            <ScalarIcon
              icon="GitHubLine"
              size="xs"
              thickness="1.75" />
          </div>
          <span>GitHub</span>
        </ScalarDropdownItem>
      </a>
      <a
        class="no-underline block"
        href="mailto:marc@scalar.com"
        target="_blank">
        <ScalarDropdownItem class="flex items-center gap-1.5 w-full">
          <div class="flex items-center justify-center">
            <ScalarIcon
              icon="Email"
              size="xs" />
          </div>
          <span>Email</span>
        </ScalarDropdownItem>
      </a>
      <span class="px-2.5 py-1.5 text-xs text-c-2 font-medium">Product</span>
      <a
        class="no-underline block"
        href="https://scalar.com/changelog"
        target="_blank">
        <ScalarDropdownItem class="flex items-center gap-1.5 w-full">
          <div class="flex items-center justify-center">
            <ScalarIcon
              icon="Changelog"
              size="xs"
              thickness="1.75" />
          </div>
          <span>Changelog</span>
        </ScalarDropdownItem>
      </a>
      <a
        class="no-underline block"
        href="https://github.com/scalar/scalar/issues/2669"
        target="_blank">
        <ScalarDropdownItem class="flex items-center gap-1.5 w-full">
          <div class="flex items-center justify-center">
            <ScalarIcon
              icon="Roadmap"
              size="xs"
              thickness="1.75" />
          </div>
          <span>Roadmap</span>
        </ScalarDropdownItem>
      </a>
    </template>
  </ScalarDropdown>
</template>
