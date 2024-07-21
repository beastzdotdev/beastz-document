'use client';

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { bus } from '@/lib/event-bus';
import { Icon } from '@iconify/react';

export const DocumentMenubar = (): JSX.Element => {
  return (
    <Menubar className="border-none p-0 h-auto shadow-none">
      <MenubarMenu>
        <MenubarTrigger className="font-medium px-2 cursor-pointer hover:bg-accent">
          File
        </MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>
              <Icon icon="solar:document-linear" className="text-xl mr-1.5" />
              New
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>
                <Icon icon="icon-park-outline:file-text" className="text-xl mr-1.5" />
                Document Text
              </MenubarItem>
              <MenubarItem>
                <Icon icon="ant-design:file-markdown-filled" className="text-xl mr-1.5" />
                Document Markdown
              </MenubarItem>
              <MenubarItem>
                <Icon icon="carbon:template" className="text-xl mr-1.5" />
                From Template
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarItem>
            <Icon icon="ion:folder-open" className="text-xl mr-1.5" />
            Open
          </MenubarItem>
          <MenubarItem>
            <Icon icon="akar-icons:copy" className="text-xl mr-1.5" />
            Make A Copy
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <Icon icon="charm:share" className="text-lg mr-1.5" />
            Share
          </MenubarItem>
          <MenubarItem>
            <Icon icon="mdi:file-move-outline" className="text-xl mr-1.5" />
            Move
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>
              <Icon icon="ic:round-file-download" className="text-xl mr-1.5" />
              Download
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Plain Text (.txt)</MenubarItem>
              <MenubarItem>Plain Markdown (.md)</MenubarItem>
              <MenubarItem>PDF (.pdf)</MenubarItem>
              <MenubarItem>Microsoft Word (.docx)</MenubarItem>
              <MenubarItem>Web (.html)</MenubarItem>
              <MenubarItem>Zip</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarItem>
            <Icon icon="mingcute:file-info-line" className="text-xl mr-1.5" />
            Details
          </MenubarItem>
          <MenubarItem>
            <Icon icon="mingcute:print-line" className="text-xl mr-1.5" />
            Print
          </MenubarItem>
          <MenubarSeparator />

          <MenubarItem>
            <Icon icon="solar:trash-bin-2-outline" className="text-xl mr-1.5" />
            Move To Bin
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="font-medium px-2 cursor-pointer hover:bg-accent">
          Edit
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Icon icon="material-symbols:undo" className="text-xl mr-1.5" />
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Icon icon="material-symbols:redo" className="text-xl mr-1.5" />
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />

          <MenubarItem>
            <Icon icon="tabler:cut" className="text-xl mr-1.5" />
            Cut <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={() => bus.publish('editor:copy')}>
            <Icon icon="ph:copy" className="text-xl mr-1.5" />
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Icon icon="octicon:paste-16" className="text-xl mr-1.5" />
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />

          <MenubarItem onClick={() => bus.publish('editor:selectAll')}>
            <Icon icon="fluent:select-all-on-24-regular" className="text-xl mr-1.5" />
            Select All <MenubarShortcut>⌘A</MenubarShortcut>
          </MenubarItem>

          <MenubarItem>
            <Icon icon="solar:trash-bin-2-outline" className="text-xl mr-1.5" />
            Delete
          </MenubarItem>
          <MenubarSeparator />

          <MenubarItem>
            <Icon icon="material-symbols:find-replace-rounded" className="text-xl mr-1.5" />
            Find And Replace <MenubarShortcut>⌘F</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="font-medium px-2 cursor-pointer hover:bg-accent">
          View
        </MenubarTrigger>

        <MenubarContent>
          <MenubarCheckboxItem>Editing</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>Readonly</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarCheckboxItem>Show Comments</MenubarCheckboxItem>
          <MenubarCheckboxItem>Minimise Comments</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>Hide Comments</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem>
            <Icon icon="ic:round-fullscreen" className="text-xl mr-1" />
            Toggle Fullscreen
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="font-medium px-2 cursor-pointer hover:bg-accent">
          Tools
        </MenubarTrigger>

        <MenubarContent>
          <MenubarItem>
            <Icon icon="fluent:text-word-count-24-filled" className="text-xl mr-1.5" />
            Word Cound <MenubarShortcut>⇧⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Icon icon="grommet-icons:user-settings" className="text-xl mr-1.5" />
            Settings
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="font-medium px-2 cursor-pointer hover:bg-accent">
          Extensions
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            <Icon icon="codicon:extensions" className="text-xl mr-1.5" />
            Coming Soon...
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
