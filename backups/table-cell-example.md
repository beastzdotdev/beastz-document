```tsx
<Table className="min-w-56">
  <TableBody>
    {people.map((e, i) => (
      // <TableRow className="rounded-xl border-none hover:bg-transparent" key={i}>
      <TableRow className="rounded-xl border-none" key={i}>
        <TableCell className="font-medium">{e.name}</TableCell>
        <TableCell className="flex justify-end">
          {/* <Button className="h-6 flex items-center" variant="destructive">
            Kick
          </Button> */}
        </TableCell>
      </TableRow>
    ))}

    {/* <TableRow className="rounded-xl border-none hover:bg-transparent pt-2">
      <TableCell />

      <TableCell className="flex justify-end">
        <Button className="h-6 flex items-center" variant="destructive">
          Disconnect
          <Icon icon="fluent:plug-disconnected-48-regular" className="text-xl ml-1" />
        </Button>
      </TableCell>
    </TableRow> */}
  </TableBody>

  {/*  */}
</Table>
```